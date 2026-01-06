package com.habitlens

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    /**
     * Check if PACKAGE_USAGE_STATS permission is granted
     * This permission requires user to manually enable it in system settings
     */
    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactContext.packageName
            )
            val granted = mode == AppOpsManager.MODE_ALLOWED
            promise.resolve(granted)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", "Failed to check permission: ${e.message}", e)
        }
    }

    /**
     * Open system settings for user to manually grant usage access permission
     * User must navigate to: Settings -> Apps -> Special Access -> Usage Access
     */
    @ReactMethod
    fun requestPermission() {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            // Silently fail - user can still access settings manually
        }
    }

    /**
     * Get usage statistics for a time range
     * @param startTime Unix timestamp in milliseconds
     * @param endTime Unix timestamp in milliseconds
     * @return Array of usage info objects
     */
    @ReactMethod
    fun getUsageStats(startTime: Double, endTime: Double, promise: Promise) {
        try {
            // Check permission first
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactContext.packageName
            )
            
            if (mode != AppOpsManager.MODE_ALLOWED) {
                promise.reject("PERMISSION_DENIED", "Usage access permission not granted")
                return
            }

            val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime.toLong(),
                endTime.toLong()
            )

            val result = Arguments.createArray()
            val packageManager = reactContext.packageManager

            // Filter and process usage stats
            for (usageStat in stats) {
                // Skip if no usage time
                if (usageStat.totalTimeInForeground <= 0) {
                    continue
                }

                // Skip system apps (optional - can be configured)
                try {
                    val appInfo = packageManager.getApplicationInfo(usageStat.packageName, 0)
                    if (appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0) {
                        // Skip system apps for cleaner data
                        continue
                    }
                } catch (e: PackageManager.NameNotFoundException) {
                    // App might be uninstalled, skip
                    continue
                }

                val usageInfo = createUsageInfoMap(usageStat, packageManager)
                result.pushMap(usageInfo)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("USAGE_STATS_ERROR", "Failed to get usage stats: ${e.message}", e)
        }
    }

    /**
     * Get app display name and category from package name
     * @param packageName Package identifier (e.g., com.instagram.android)
     * @return Map with appName and category
     */
    @ReactMethod
    fun getAppInfo(packageName: String, promise: Promise) {
        try {
            val packageManager = reactContext.packageManager
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            val appName = packageManager.getApplicationLabel(appInfo).toString()
            
            // Get app category (API 26+)
            val category = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                getCategoryName(appInfo.category)
            } else {
                "Unknown"
            }

            val result = Arguments.createMap()
            result.putString("appName", appName)
            result.putString("category", category)
            promise.resolve(result)
        } catch (e: PackageManager.NameNotFoundException) {
            promise.reject("APP_NOT_FOUND", "App not found: $packageName", e)
        } catch (e: Exception) {
            promise.reject("APP_INFO_ERROR", "Failed to get app info: ${e.message}", e)
        }
    }

    /**
     * Create a WritableMap from UsageStats object
     */
    private fun createUsageInfoMap(usageStat: UsageStats, packageManager: PackageManager): WritableMap {
        val map = Arguments.createMap()
        
        // Get app name
        val appName = try {
            val appInfo = packageManager.getApplicationInfo(usageStat.packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            usageStat.packageName
        }

        map.putString("packageName", usageStat.packageName)
        map.putString("appName", appName)
        map.putDouble("totalTimeInForeground", usageStat.totalTimeInForeground.toDouble())
        map.putDouble("lastTimeUsed", usageStat.lastTimeUsed.toDouble())
        map.putDouble("firstTimeUsed", usageStat.firstTimeStamp.toDouble())
        
        // Launch count (API 28+)
        val launchCount = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            usageStat.appLaunchCount
        } else {
            0
        }
        map.putInt("launchCount", launchCount)

        return map
    }

    /**
     * Convert category ID to readable name
     */
    private fun getCategoryName(category: Int): String {
        return if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            when (category) {
                ApplicationInfo.CATEGORY_GAME -> "Game"
                ApplicationInfo.CATEGORY_AUDIO -> "Audio"
                ApplicationInfo.CATEGORY_VIDEO -> "Video"
                ApplicationInfo.CATEGORY_IMAGE -> "Image"
                ApplicationInfo.CATEGORY_SOCIAL -> "Social"
                ApplicationInfo.CATEGORY_NEWS -> "News"
                ApplicationInfo.CATEGORY_MAPS -> "Maps"
                ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Productivity"
                else -> "Other"
            }
        } else {
            "Unknown"
        }
    }
}
