require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'RoastWidgetBridge'
  s.version        = package['version']
  s.summary        = 'Writes the Roast widget snapshot into the shared App Group container.'
  s.description    = package['description'] || s.summary
  s.license        = package['license'] || 'MIT'
  s.author         = package['author'] || 'COZA'
  s.homepage       = package['homepage'] || 'https://github.com/chukwuma-azubuike/coza-workforce-app'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/chukwuma-azubuike/coza-workforce-app' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
