package com.habitlens

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        // Stub - will implement in Phase 1
        promise.resolve(false)
    }

    @ReactMethod
    fun requestPermission() {
        // Stub - will implement in Phase 1
    }

    @ReactMethod
    fun getUsageStats(startTime: Double, endTime: Double, promise: Promise) {
        // Stub - will implement in Phase 1
        promise.resolve(emptyArray<Any>())
    }

    @ReactMethod
    fun getAppInfo(packageName: String, promise: Promise) {
        // Stub - will implement in Phase 1
        promise.resolve(null)
    }
}
