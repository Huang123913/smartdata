## meta
> https://meta-apis-v1.nocodb.com

### Auth
- ⚪️ Signup
- ⚪️ Signout
- ⚪️ Signin
- 🟢 Get User Info `/api/v1/auth/user/me`
- ⚪️ Forget Password
- ⚪️ Change Password
- ⚪️ Verify Reset Token
- ⚪️ Verify Email
- ⚪️ Reset Password
- ⚪️ Refresh Token
- 🟢 List Base Users `/api/v1/db/meta/projects/{baseId}/users`
- ⚪️ Create Base User
- ⚪️ Update Base User
- ⚪️ Delete Base User
- ⚪️ Resend User Invitation

### Base
- ⚪️ Get Base info
- ⚪️ Get UI ACL
- ⚪️ Create UI ACL
- 🟢️ List Projects `/api/v1/db/meta/projects`
- ⚪️ Create Base
- ⚪️ Duplicate Base Source
- ⚪️ Duplicate Base
- 🟢 Get Base `/api/v1/db/meta/projects/{baseId}`
- ⚪️ Delete Base
- ⚪️ Update Base
- ⚪️ Base user meta update
- ⚪️ Get Base Shared Base
- ⚪️ Delete Base Shared Base
- ⚪️ Create Base Shared Base
- ⚪️ Update Base Shared Base
- ⚪️ Base Cost
- ⚪️ Sync Meta
- ⚪️ Meta Diff
- ⚪️ List Empty & Null Filter
- ⚪️ List Audits in Base

### DB Table
- ⚪️ Create Table
- 🟢 List Tables `/api/v1/db/meta/projects/{baseId}/tables`
- 🟢 Read Table `/api/v1/db/meta/tables/{tableId}`
- ⚪️ Update Table
- ⚪️ Delete Table
- ⚪️ Duplicate Table
- ⚪️ Duplicate Column
- ⚪️ Reorder Table

### DB Table Column
- ⚪️ Create Column `/api/v1/db/meta/tables/{tableId}/columns`
- ⚪️ Update Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Delete Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Get Column
- ⚪️ Create Primary Value
- ⚪️ Get columns hash for table
- ⚪️ Bulk create-update-delete columns

### DB View
- 🟢 List Views `/api/v1/db/meta/tables/{tableId}/views`
- ⚪️ Update View
- ⚪️ Delete View
- ⚪️ Show All Columns In View
- ⚪️ Hide All Columns In View
- ⚪️ Create Grid View
- ⚪️ Create Form View
- ⚪️ Update Form View
- ⚪️ Get Form
- ⚪️ Update Form Column
- ⚪️ Update Grid View
- ⚪️ List Grid Columns
- ⚪️ Update Grid Column
- ⚪️ Create Gallery View
- ⚪️ Update Gallery View
- ⚪️ Get Gallery View
- ⚪️ Create Kanban View
- ⚪️ Update Kanban View
- ⚪️ Get Kanban View
- ⚪️ Create Map View
- ⚪️ Update Map View
- ⚪️ Get Map View
- ⚪️ Create Calendar View
- ⚪️ Update Calendar View
- ⚪️ Get Calendar View

### DB View Column
- 🟢 List Columns In View `/api/v1/db/meta/views/{viewId}/columns`
- ⚪️ Create Column in View
- ⚪️ Update View Column

### Utils
- ⚪️ List Comments in Audit
- ⚪️ Comment Rows
- ⚪️ Update Comment in Audit
- ⚪️ Count Comments
- ⚪️ Update Audit Row
- ⚪️ Test DB Connection
- ⚪️ utils-select-query
- ⚪️ Convert JDBC URL to Config
- ⚪️ Get App Info
- ⚪️ Axios Request
- ⚪️ Get App Version
- ⚪️ Get Application Health Status
- ⚪️ Get Aggregated Meta Info
- ⚪️ Get Cache
- ⚪️ Delete Cache
- 🟢️ Get command palette suggestions `/api/v1/db/meta/audits/comments`

### DB Table Filter
- 🟢️ Get View Filter `/api/v1/db/meta/views/{viewId}/filters`
- ⚪️ Create View Filter
- ⚪️ Get Filter
- ⚪️ Update Filter
- ⚪️ Delete Filter
- ⚪️ Get Filter Group Children

### DB Table Sort
- 🟢️ List View Sorts `/api/v1/db/meta/views/{viewId}/sorts`
- ⚪️ Update View Sort
- ⚪️ Get Sort
- ⚪️ Update Sort
- ⚪️ Delete Sort


## Data
### DB View Row
- ⚪️ Table Group by Column
- 🟢️ List Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}`
- ⚪️ Create Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}`
- ⚪️ Find One Table View Row
- ⚪️ Group By Table View Row
- ⚪️ Count Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/count`
- ⚪️ Get Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/{rowId}`
- ⚪️ Update Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/{rowId}`
- ⚪️ Delete Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/{rowId}`
- ⚪️ Does Table View Row Exist
- ⚪️ Export Table View Rows

## 第一阶段 (能进入表页面)

### 进入: 项目
- 🟢️ List Projects `/api/v1/db/meta/projects`
- 🟡 Get command palette suggestions `/api/v1/db/meta/audits/comments`
- 🟡 Get User Info `/api/v1/auth/user/me`
- 🟢 Get Base `/api/v1/db/meta/projects/{baseId}`
- 🟡 Get User Info `/api/v1/auth/user/me?base_id=`
- 🟢 List Tables `/api/v1/db/meta/projects/{baseId}/tables`
- 🟡 List Base Users `/api/v1/db/meta/projects/{baseId}/users`

### 进入: 表
- 🟢 Read Table `/api/v1/db/meta/tables/{tableId}`
- 🟢 List Views `/api/v1/db/meta/tables/{tableId}/views`
- 🟢 List Columns In View `/api/v1/db/meta/views/{viewId}/columns`
- 🟢️ List Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}`
- 🟡️ Get View Filter `/api/v1/db/meta/views/{viewId}/filters`
- 🟡️ List View Sorts `/api/v1/db/meta/views/{viewId}/sorts`

### 编辑: 表格数据
- ⚪️ Update Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/{rowId}`
- ⚪️ Delete Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/{rowId}`
- ⚪️ Create Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}`
- ⚪️ Get Table View Row `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/{rowId}`
- ⚪️ Count Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}/count`

### 编辑: 表格结构
- ⚪️ Delete Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Update Column `/api/v1/db/meta/columns/{columnId}`
- ⚪️ Create Column `/api/v1/db/meta/tables/{tableId}/columns`