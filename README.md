# AL ID Range Manager

This extension provides quick and centralized object id assignment using Microsoft Dynamics 365 Business Central API.

## Features

### ALRM: Initialize

Creates an extension record in connected Business Central instance. Id, name and brief from the app.json file in the currently selected workspace are stored in BC. 

Range code must be selected during the initialization process. Different object ranges can be specified for range codes in BC. There is also an option to choose a prefix to check all object names before a new id is assigned.

### ALRM: New object extension

Creates an extension object record of selected type and name in connected Business Central instance. New untitled file is created and initialized with corresponding standard AL language object snippet and object id assigned by BC.

<!-- XXX fix after a repository is added ! [New object command] (images/newObjectCommand.gif) -->

### ALRM: New object extension field or value

Creates an extension object line record in connected Business Central instance. Only usable in table extensions and enum extensions. Creates a new field or enum value at current cursor position with id provided by BC.

## Requirements

Requirements

## Extension Settings

- **al-id-range-manager.baseUrl**: Business Central API base url 
    - format https://{server}:{port}/{instance}/api/teamARTAAAE/extension/v1.0/
- **al-id-range-manager.username**: Business Central API username
- **al-id-range-manager.password**: Business Central API password

Basic authorization is the only currently supported authorization method.

## Known Issues

No known issues

## Release Notes

### 0.0.1

Initial release
