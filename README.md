# AL ID Range Manager

This extension provides quick and centralized object id assignment using any API (for example Microsoft Dynamics 365 Business Central API).

## Features

### ALRM: Initialize

Creates an extension record in connected Business Central instance. Id, name and brief from the app.json file in the currently selected workspace are stored in BC.

Based on setup (see Extension Setting) range code may be required during the initialization process. Different object ranges can be specified for range codes in BC. There is also an option to choose a prefix to check all object names before a new id is assigned.

### ALRM: New object extension

Creates an extension object record of selected type and name in connected Business Central instance. New untitled file is created and initialized with corresponding standard AL language object snippet and object id assigned by BC.

<!-- XXX fix after a repository is added ! [New object command] (images/newObjectCommand.gif) -->

### ALRM: New object extension field or value

Creates an extension object line record in connected Business Central instance. Only usable in table extensions and enum extensions. Creates a new field or enum value at current cursor position with id provided by BC.

## Requirements

No specific requirements.

## Extension Settings

- **al-id-range-manager.baseUrl**: API Base URL  
  - Specifies URL of the APIs
  - Format (for usage with Microsoft Dynamics 365 Business Central)
    - `https://{server}:{port}/{instance}/api/teamARTAAAE/extension/v1.0/`
- **al-id-range-manager.username**: API Username
  - Specifies username for autentification in the API
- **al-id-range-manager.password**: API Password
  - Specifies password for autentification in the API
- **al-id-range-manager.assignableRange**: Use the First Assignable Range
  - Specifies how the assignable ranges should be used.
  - Values
    - API: Using this value, the assignable range will be mandatory.
    - Do Not Use: Using this value, the assignable range will be skipped.

Basic authorization is the only currently supported authorization method.

## Known Issues

No known issues

## Release Notes

See [changelog](CHANGELOG.md)
