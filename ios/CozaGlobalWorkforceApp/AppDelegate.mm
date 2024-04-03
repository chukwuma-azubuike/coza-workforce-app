#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
[FIRApp configure];
  self.moduleName = @"CozaGlobalWorkforceApp";
// You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Create a storyboard object 
  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle: [NSBundle bundleWithIdentifier:@"com.cozaworkforceapp"]];
  // Instantiate the initial view controller
  UIViewController *launchVC = [storyboard instantiateInitialViewController];

  // Add the view controller to the window
  [self.window setRootViewController:launchVC];

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
