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

To use this VS Code extension, you must set API connection to the backend system that store, validate & manage all extension objects & fields details.

We prepared Microsoft Dynamics 365 Business Central Extension that  met all requirements and is designed to work together with this VS Code extension. The source codes could be found on GitHub: <https://github.com/TKapitan/ALRM-BusinessCentral>

However, this VS Code extension could be used with your own backend side, created in the Business Central or using any other programming language.

To use this extension, the API must provide:

- API endpoints (currently, only ODATA api format is supported)
  - extensions
    - The API endpoint must process POST create 
      - The create request contains data
        - id
          - Guid
          - Guid of the extension, is used as a key. The value is automatically loaded from the app.json file.
        - rangeCode
          - String
          - Code of the ranges that should be used to assign IDs.
          - Is used only when the "Assignable Ranges" is set to "API".
        - name
          - String (250 characters)
          - Name of the extension automatically loaded from app.json
        - description
          - String (250 characters)
          - Description of the extension automatically loaded from app.json
    - The API endpoint must process two actions (POST requests) 
      - Microsoft.NAV.createObject 
        - Accept three parameters (newly created object identification) and return ID of the object as a number.
        - Parameters
          - objectType
            - String
            - Specifies type of the newly created object.
            - In the format of Business Central objects (for example: Table/TableExtension/...).
          - objectName
            - String
            - Specifies name of the newly created object.
          - createBy
            - String (50 characters)
            - Specifies user identification who did the request.
        - Return Value
          - Number
          - ID of the newly created object, will be automatically inserted to the created object.
      - Microsoft.NAV.createObjectLine
        - Accept two parameters (object identification in which the field should be created) and return ID of the field as a number.
        - Parameters
          - objectType
            - String
            - Specifies type of the object in which we want to create a field.
            - In the format of Business Central objects (for example: Table/TableExtension/...).
          - objectID
            - String
            - Specifies ID of the object in which we want to create a field.
        - Return Value
          - Number
          - ID of the newly created field, will be automatically inserted to the created field.
  - assignableRanges
    - Is used only when the "Assignable Ranges" is set to "API".
    - The API endpoint must process GET 
      - Without filters
      - Response must contain
        - code
          - String
          - Identification of assignable ranges that could be used for creating a new extension.
          - The value is later used as a parameter "rangeCode" in the "extensions" API endpoint for POST create method.

## Extension Settings

- **al-id-range-manager.baseUrl**: API Base URL  
  - Specifies URL of the APIs
  - Format (for usage with Microsoft Dynamics 365 Business Central)
    - `https://{server}:{port}/{instance}/api/teamARTAAAE/extension/v1.0/`
- **al-id-range-manager.authenticationType**: API Authentication Type
  - Specifies type of the authentification the API require
  - Basic auth is the only currently supported authentification method.
- **al-id-range-manager.username**: API Username
  - Specifies username for autentification in the API
- **al-id-range-manager.password**: API Password
  - Specifies password for autentification in the API
- **al-id-range-manager.assignableRange**: Assignable Ranges
  - Specifies how the assignable ranges should be used.
  - Values
    - API: Using this value, the assignable range will be mandatory.
    - Do Not Use: Using this value, the assignable range will be skipped.

## Known Issues

No known issues

## Release Notes

See [changelog](https://github.com/TKapitan/ALRM-VSCode/blob/master/CHANGELOG.md)
