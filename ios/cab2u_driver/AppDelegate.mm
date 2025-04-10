#import "AppDelegate.h"
#import <Firebase.h> 
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"AIzaSyCI7CwlYJ6Qt5pQGW--inSsJmdEManW-K0"]; // add this line using the api key obtained from Google Console
  @try {
    if ([FIRApp defaultApp] == nil) { // Prevent duplicate config
      [FIRApp configure];
    }
  } @catch (NSException *exception) {
    NSLog(@"🔥 Firebase configuration error: %@", exception.reason);
    // Handle error (e.g., show alert or fallback behavior)
  }

  self.moduleName = @"cab2u_driver";
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
