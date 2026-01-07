package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class UsageStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    // Check if usage access permission is granted
    AsyncFunction("hasPermission") {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName
        )
      } else {
        @Suppress("DEPRECATION")
        appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          context.packageName
        )
      }
      mode == AppOpsManager.MODE_ALLOWED
    }

    // Open system settings to request permission
    Function("requestPermission") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
      context.startActivity(intent)
    }

    // Get usage statistics for a time range
    AsyncFunction("getUsageStats") { startTime: Double, endTime: Double ->
      val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val packageManager = context.packageManager

      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        startTime.toLong(),
        endTime.toLong()
      )

      val result = mutableListOf<Map<String, Any>>()

      for (usageStat in stats) {
        // Skip system apps and apps with zero usage
        if (usageStat.totalTimeInForeground == 0L) continue
        
        try {
          val appInfo = packageManager.getApplicationInfo(usageStat.packageName, 0)
          if (appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0) continue

          val appName = packageManager.getApplicationLabel(appInfo).toString()

          result.add(
            mapOf(
              "packageName" to usageStat.packageName,
              "appName" to appName,
              "totalTimeInForeground" to usageStat.totalTimeInForeground,
              "lastTimeUsed" to usageStat.lastTimeUsed,
              "firstTimeUsed" to if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                usageStat.firstTimeStamp
              } else {
                usageStat.firstTimeStamp
              },
              "launchCount" to if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                usageStat.totalTimeVisible.toInt()
              } else {
                0
              }
            )
          )
        } catch (e: PackageManager.NameNotFoundException) {
          // App not found, skip
          continue
        }
      }

      result
    }

    // Get app information by package name
    AsyncFunction("getAppInfo") { packageName: String ->
      val packageManager = context.packageManager
      
      try {
        val appInfo = packageManager.getApplicationInfo(packageName, 0)
        val appName = packageManager.getApplicationLabel(appInfo).toString()
        
        val category = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          when (appInfo.category) {
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

        mapOf(
          "appName" to appName,
          "category" to category
        )
      } catch (e: PackageManager.NameNotFoundException) {
        throw Exception("App not found: $packageName")
      }
    }
  }

  private val context
    get() = requireNotNull(appContext.reactContext) {
      "React Application Context is null"
    }
}
