# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.WritableNativeMap { *; }
-keep class com.facebook.react.bridge.WritableNativeArray { *; }
-keep class com.facebook.react.bridge.ReadableNativeMap { *; }
-keep class com.facebook.react.bridge.ReadableNativeArray { *; }
-keep class com.facebook.react.bridge.NativeModule { *; }
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.BaseJavaModule { *; }
-keep class com.facebook.react.uimanager.RootView { *; }
-keep class com.facebook.react.uimanager.UIImplementation { *; }
-keep class com.facebook.react.uimanager.ViewManager { *; }
-keep class com.facebook.react.uimanager.events.Event { *; }
-keep class com.facebook.react.views.view.ReactViewGroup { *; }
-keep class com.facebook.react.views.view.ReactViewManager { *; }

-keepattributes Signature
-keepattributes *Annotation*
-keep class com.facebook.react.bridge.queue.NativeRunnable { *; }

-keep class com.facebook.react.devsupport.** { *; }

# For the New Architecture
-keep class com.facebook.jni.HybridData { *; }
-keep class com.facebook.proguard.annotations.DoNotStrip { *; }

# OkHttp
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# Keep everything for vector icons
-keep class com.horcrux.svg.** { *; }
-keep class com.oblador.vectoricons.** { *; }
