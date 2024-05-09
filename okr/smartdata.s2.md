# SmartData (第二阶段)

## 整体目标:
> 说明: 本阶段不涉及用户、权限、登录相关特性对接
1. `数据模型`相关特性对接至自建服务
2. `菜单目录`相关特性对接至自建服务
3. 前端体验优化
4. 支持单机部署

-------------------------------------------------------------------------------

### 场景拆分:

#### 1. 数据模型接口对接 (**?人日**)
> 目标: `数据模型`相关特性对接至自建服务 (Meta, Data)
1. 表数据操作接口 `10个`, 预计至少实现其中 `10个`
2. 表结构操作接口 `25个`, 预计至少实现其中 `9个`
3. 数据导入接口

#### 2. 菜单目录接口对接 (**?人日**)
> 目标: `菜单目录`相关特性对接至自建服务 (Base, Project)
1. 菜单相关接口 `21个`, 预计至少实现其中 `3个`

#### 3. 前端功能
> 目标: 完善操作体验、报错重试等逻辑，提供可被外部嵌入的独立页面
1. 模型树增加: 全选、反选 (**1**)
   > 完成
2. 生成结果失败时自动重试 3 次 (**2**)
   > 完成
3. 单独提供`数据导入`页 (**2**)
4. 单独提供`数据查看`页 (**5**)
5. 单独提供`现有模型训练`页, 管理员主动触发 (**2**)
   > 接口: 完成, 页面: 完成, 未部署
6. 发布模型时可设置: 定时更新, 实时获取
   > 前端: 完成, 接口: 未提供
7. 发布模型时可选择发布至现有模型 (**3**)
8. VSQL层面的报错不需要/repair (**1**)
9. 多语言翻译完善 (**1**)  
   > 进行中

#### 4. Docker 部署
> 目标: 把前后端两个服务打包在一起，生成独立的部署包
1. 把前端的请求都按标准封装到 Nuxt 的后台 (**3**)
   > 进行中
2. 生成 Docker 部署包 (**3**)
3. 服务闪退问题

#### 5. APIs 桥接
> 目标: 桥接最基础的接口: 操作数据、操作表结构、操作目录(Base,Project)
> 优先级: 🟢 高(16), 🟡 中(7), ⚪️ 低(13), ❔ 暂缓(18)

- 数据操作接口
   1. 🟢 List Table Records
   2. 🟢 Create Table Records
   3. 🟢 Update Table Records
   4. 🟢 Delete Table Records
   5. 🟢 Read Table Record
   6. 🟢 Count Table Records
   7. ❔ List Linked Records
   8. ❔ Link Records
   9. ❔ Unlink Records
   10: 🟢 Attachment Upload

- Base
   1. 🟢 Get Base info
   2. ❔ Get UI ACL
   3. ❔ Create UI ACL
   4. 🟢 List Bases
   5. 🟢 Create Base
   6. Duplicate Base Source
   7. Duplicate Base
   8. 🟢 Get Base
   9. 🟡 Delete Base
   10. 🟡 Update Base
   11. ❔ Base user meta update
   12. ❔ Get Base Shared Base
   13. ❔ Delete Base Shared Base
   14. ❔ Create Base Shared Base
   15. ❔ Update Base Shared Base
   16. ❔ Base Cost
   17. ❔ Sync Meta
   18. ❔ Meta Diff
   19. ❔ List Empty & Null Filter
   20. ❔ List Audits in Base

- DB Table
   1. 🟢 Create Table
   2. 🟢 List Tables
   3. 🟢 Read Table
   4. 🟡 Update Table
   5. 🟡 Delete Table
   6. ⚪️ Duplicate Table
   7. ❔ Reorder Table

- DB Table Column
   1. 🟢 Create Column
   2. 🟢 Update Column
   3. 🟡 Delete Column
   4. 🟡 Get Column
   5. 🟡 Create Primary Value
   6. ❔ Get columns hash for table
   7. ❔ Bulk create-update-delete columns

- DB Table Filter
   1. ⚪️ Get View Filter
   2. ⚪️ Create View Filter
   3. ⚪️ Get Filter
   4. ⚪️ Update Filter
   5. ⚪️ Delete Filter
   6. ⚪️ Get Filter Group Children

- DB Table Sort
   1. ⚪️ List View Sorts
   2. ⚪️ Update View Sort
   3. ⚪️ Get Sort
   4. ⚪️ Update Sort
   5. ⚪️ Delete Sort

-------------------------------------------------------------------------------

## 接口实现 (第一阶段)
> 目标: 能进入表页面查看
> 🟢: 后端实现, 前端对接
> 🟡: 前端实现

### 进入: 项目 (查看)
   - 🟢️ List Projects `/api/v1/db/meta/projects` **完成**
   - 🟡 Get command palette suggestions `/api/v1/db/meta/audits/comments`**完成**
   - 🟡 Get User Info `/api/v1/auth/user/me` **完成**
   - 🟢 Get Base `/api/v1/db/meta/projects/{baseId}` **完成**
   - 🟡 Get User Info `/api/v1/auth/user/me?base_id=` **完成**
   - 🟢 List Tables `/api/v1/db/meta/projects/{baseId}/tables` **完成**
   - 🟡 List Base Users `/api/v1/db/meta/projects/{baseId}/users` **完成**

### 进入: 表格 (查看)
   - 🟢 Read Table `/api/v1/db/meta/tables/{tableId}` **后端:已提供,前端:进行中**
   - 🟢 List Views `/api/v1/db/meta/tables/{tableId}/views`
   - 🟢 List Columns In View `/api/v1/db/meta/views/{viewId}/columns`
   - 🟢️ List Table View Rows `/api/v1/db/data/{orgs}/{baseName}/{tableName}/views/{viewName}`
   - 🟡️ Get View Filter `/api/v1/db/meta/views/{viewId}/filters` **进行中**
   - 🟡️ List View Sorts `/api/v1/db/meta/views/{viewId}/sorts` **进行中**

## 5.6
> 正式环境: http://smartdata.yindangu.com
> 测试环境: http://smartdata-server.yindangu.com

### 前端
   - 【进行中】迁移后端请求到 Nuxt 后端 
   - 【暂缓】发布模型时可选择发布至现有模型界面 (完成UI，未对接接口)
   - 【完成】处理权限控制相关 (拦截器、权限校验前端模拟返回有权限) 
   - 【完成】VSQL层面的报错不需要/repair
   - 【完成】完成 `进入: 项目(查看)` 的 7 个接口联调 (部署到测试环境)

### 平台
   - 【进行中】V: 弹窗支持调用浏览器局部打印
   - 【暂缓】V: 前端导出规则不要把隐藏的字段也导出来 (项目不急)

### 后端
1. 生成 DDL 接口-调整 （2024-04-28）
   - a.【完成】物理表名调整为模型名

2. SQL 查询接口-调整
   - a.【完成】SQL 中表名接受模型名（2024-04-28）
   - b.【完成】对于模型名重复的，支持结合传入的企业 ID，项目标识进行唯一定位（2024-04-28）
   - c.【进行中】查询结果集中支持追溯结果集列的来源物理表字段，得到字段中文名，返回到列元信息中（五一后）
   - d.【完成】查询结果集中空列名的兜底处理（2024-04-29）

3. 模型发布&保存接口-调整（2024-04-30）
   - a.【完成】支持删除模型表的发布功能

4. 模型复制接口-新实现（2024-04-30）
   - a.【完成】支持模型的复制
   - b.支持模型复制的物理表结构发布
   - c.支持模型复制的物理表数据复制
