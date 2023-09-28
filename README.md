# AL ID Range Manager (VS Code extension)

This VS Code extension provides quick and centralized object id assignment using any API (for example Microsoft Dynamics 365 Business Central API). The corresponding Microsoft Dynamics 365 Business Central extension that support all processes is also on GitHub: <https://github.com/TKapitan/ALRM-BusinessCentral>.

## Features

### ALRM: Initialize

Creates an extension record in connected Business Central instance. Id, name and brief from the app.json file in the currently selected workspace are stored in BC.

Based on setup (see Extension Setting) range code may be required during the initialization process. Different object ranges can be specified for range codes in BC. There is also an option to choose a prefix to check all object names before a new id is assigned.

### ALRM: Synchronize

Synchoronize is a command that scan all AL files in the project and register all of existing objects (and fields for table and enum extensions). The extension has to be initialized first, than it is possible to run this command (may taky up to 10 minutes based on number of existing AL objects.).

The project has to met all defined rules on corresponding Assignable Range (object ID range, field ID range, object name structure and object ID and name uniqueness). If there are any error, other objects are synchronized and all errors are showned to the user once the synchronization ends.

The project (all objects) is scanned each time the command is run. The scanning and registering are done synchronously. Deleting of object field/values or deleting of objects is not supported.

### ALRM: New object

Creates object record of selected type and name in connected Business Central instance. New untitled file is created and initialized with corresponding standard AL language object snippet and object id assigned by BC.

Since v0.3.1 the command filter object types based on runtime version specified in app.json (users are not able to choose object type that is not available for project runtime).

![New Object Command](./images/newObjectCommand.gif)

### ALRM: New object extension field or value

Creates an extension object line record in connected Business Central instance. Only usable in table extensions and enum extensions. Creates a new field or enum value at current cursor position with id provided by BC.

### ALRM: Switch object IDs (BETA)

Allows to automatically switch IDs for all objects and table/enum extensions. The extension must have alternate assignable range assigned in ALRM for Business Central. Using this command, you can freely switch ID ranges between two different ranges (for example one for ONPREM range and another for CLOUDONLY range).

Available since v0.6.1 and works with ALRM Business Central extension version 0.1.7.0.

## Requirements

To use this VS Code extension, you must set API connection to the backend system that store, validate & manage all extension objects & fields details.

We prepared Microsoft Dynamics 365 Business Central Extension that  met all requirements and is designed to work together with this VS Code extension. The source codes could be found on GitHub: <https://github.com/TKapitan/ALRM-BusinessCentral>

However, this VS Code extension could be used with your own backend side, created in the Business Central or using any other programming language.

## Extension Settings

- **API Type**: `al-id-range-manager.apiType`
  - Specifies the API type.
  - Available options:
    - *OnPrem*
    - *Cloud*
  - **OnPrem** allows you to specify your own url in **Base Url**. Use **Cloud** in combination with **Oauth** authentication to connect to cloud BC.
- **Base Url Without Version**: `al-id-range-manager.baseUrlWithoutVersion`
  - Specifies URL of the APIs without specific API version and/or company.
  - Format (for usage with Microsoft Dynamics 365 Business Central On-Premises).
    - `https://{server}:{port}/{instance}/api/teamARTAAAE/extension/`
  - Format (for usage with Microsoft Dynamics 365 Business Central Online / Cloud).
    - `https://api.businesscentral.dynamics.com/v2.0/{domain}/{environment}/api/teamARTAAAE/extension/`
    - Example:
      - `https://api.businesscentral.dynamics.com/v2.0/kepty.cz/production/api/teamARTAAAE/extension/`
- **API Version**: `al-id-range-manager.apiVersion`
  - Specifies version of used API. The API version must be available in BC.
  - In the Business Central it is possible to define minimal used API version for communication. In that case, lower/older versions can not be used and hence this setting must be changed by user to the newer version.
- **Tenant**: `al-id-range-manager.tenant`
  - Specifies tenant on which the API is hosted. Default value is "default".
- **Environment**: `al-id-range-manager.environment`
  - Specifies environment (BC instance) on which the API is hosted.
- **Company Id**: `al-id-range-manager.companyId`
  - Specifies ID of the company for API URL. The value must be company ID without leading/ending "{}".
  - If there are only one company accessible with provided authentification, the value can be blank.
  - If the instance's default company should be used, the value can be also blank.
- **API Authentication Type**: `al-id-range-manager.authenticationType`
  - Specifies type of the authentification the API require.
  - Available options:
    - *Basic*
    - *Oauth*
- **API Username**: `al-id-range-manager.username`
  - Specifies username for *Basic* autentification.
- **API Password**: `al-id-range-manager.password`
  - Specifies password for *Basic* autentification.
- **Snippets**: `al-id-range-manager.snippets`
  - Specifies which snippets are used for the "New Object" command.
  - Available options:
    - Default (standard Microsoft's snippets)
    - Waldo's CRS AL Language Snippets

### OnPrem settings

```json
{
  "al-id-range-manager.apiType": "OnPrem",
  "al-id-range-manager.authenticationType": "Basic",
  "al-id-range-manager.baseUrlWithoutVersion": "https://{server}:{port}/{instance}/api/teamARTAAAE/extension/",
  "al-id-range-manager.apiVersion": "1.1",
  "al-id-range-manager.tenant": "{tenant}",
  "al-id-range-manager.environment": "{environment}",
  "al-id-range-manager.companyId": "{guid}",
  "al-id-range-manager.username": "{username}",
  "al-id-range-manager.password": "{password}",
}
```

### Cloud settings

```json
{
  "al-id-range-manager.apiType": "Cloud",
  "al-id-range-manager.authenticationType": "Oauth",
  "al-id-range-manager.apiVersion": "1.1",
  "al-id-range-manager.tenant": "{tenant}",
  "al-id-range-manager.environment": "{environment}",
  "al-id-range-manager.companyId": "{guid}"
}
```

### Oauth authentication

**Cloud** API type and **Oauth** authentication were added to support connecting to cloud BC.

With **Cloud** API type you are no longer required to specify **Base Url Without Version**, url will now be created automatically using the specified **Tenant**, **Environment**, **Version**, and optionally **Company Id**.

**Oauth** is implemented using the [Device Authorization Grant](https://oauth.net/2/device-flow/) that should be familiar to everyone developing or debugging on cloud BC instances. You will be prompted to open your browser, enter a short code, and log in using your Microsoft account.

#### App consent

Currently, the app is using hard-coded app registration. To use it, you will most likely must first grant admin consent. You can do that [using this link](https://login.microsoftonline.com/organizations/adminconsent?client_id=d64dcf39-568d-4049-a24e-0f3ac9113dbd).
Would you like to use your own app? Submit an issue (or a PR) to add it.

## Known Issues

For list of minor issues and upcoming changes see <https://github.com/TKapitan/ALRM-VSCode/blob/master/CHANGELOG.md#unreleased>

## Release Notes

See [changelog](https://github.com/TKapitan/ALRM-VSCode/blob/master/CHANGELOG.md)
