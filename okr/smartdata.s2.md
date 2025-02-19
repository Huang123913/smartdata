# SmartData (第二阶段)

## 整体目标:
> 说明: 本阶段不涉及用户、权限、登录相关特性对接
1. `数据模型`相关特性对接至自建服务 **完成**
2. `菜单目录`相关特性对接至自建服务 **完成**
3. 前端体验优化
4. 支持单机部署   555

-------------------------------------------------------------------------------

### 场景拆分:

#### 1. 数据模型接口对接 (**?人日**)
   > 目标: `数据模型`相关特性对接至自建服务 (Meta, Data)
   1. 表数据操作接口 **完成**
   2. 表结构操作接口 **完成**
   3. 数据导入接口 **完成**

#### 2. 菜单目录接口对接 (**?人日**)
   1. 菜单相关接口 **完成**

#### 3. 前端功能
   > 目标: 完善操作体验、报错重试等逻辑，提供可被外部嵌入的独立页面
   1. 模型树增加: 全选、反选 **完成**
   2. 生成结果失败时自动重试 3 次 **完成**
   3. 单独提供`数据导入`页 **完成**
   4. 单独提供`数据查看`页 **完成**
   5. 单独提供`现有模型训练`页, 管理员主动触发 **完成**
   6. 发布模型时可设置: 定时更新, 实时获取 **完成**
   7. 发布模型时可选择发布至现有模型 **完成**
   8. VSQL层面的报错不需要/repair **完成**
   9. 多语言翻译完善 **持续中**

#### 4. Docker 部署
   > 目标: 把前后端两个服务打包在一起，生成独立的部署包
   1. 把前端的请求都按标准封装到 Nuxt 的后台 **完成**
   2. 生成 Docker 部署包
   3. 服务闪退问题 **完成**

## 接口对接
### 语义搜索
 - ⚪️ 数据向量化 (全量) **进行中**
 - ⚪️ 数据向量化 (增量)
 - ⚪️ 语义化查询

## 7.31
   > 正式环境: http://smartdata.yindangu.com
   > 测试环境: http://smartdata-server.yindangu.com

### 场景
   #### 自动补偿
      目标: 为防止服务不可用时, MCDM 调 SmartData 的向量化接口失败而做的一个定时补偿机制
      逻辑: 在 SmartData 的后台 (nocodb) 起一个定时任务, 看看有没挂起的向量化任务

   #### 标记语义分析字段
      目标: 对指定字段标记为语义分析, 自动执行数据向量化
      逻辑:
         1. 🟢 前端: 标记字段 **完成**
         2. 🟢 发起开始向量化接口 (SD -> MCDM) **完成**
         3. 🟢 向量化回调接口 (MCDM -> SD) **完成**
         4. 🟢 生成 parquet 文件 (SD -> LLM) **完成**
         5. 🟢 发送 parquet 文件 (SD -> MCDM) **完成**

### 前端
   - 【进行中】侧栏聊天控件   
      > 完成: /talktodata 图片、文本 数据结构更新
      > 进行中: 排查: 批量数据向量化会偶发报错、服务器无响应
   - 【进行中】docker 部署
      > 完成: 待发布到 docker hub
      > 进行中: 代码部署到 release 分支时自动发布 docker hub
   - 【完成】合并 nocodb v0.251.1
   - 【完成】合并 nocodb v0.251.0
      > 先部署在测试库验证一段时间

### 需求池
   - 数据透视
   - 存储 Prompt 模板
   - MCMD: 发布模型时, 允许编辑表名及字段名 **完成**
   - MCDM: 发布模型时, 更新频率接口对接 **完成**
   - MCDM: 表间数据复制 **完成**
   - MCDM: 保存文件导入的原文件 **完成**
   - LLM: TalkData 智能分析
   - LLM: 修改模型元信息时重新训练 **完成**
   - LLM: 存储训练数据 (修改模型时重训) **完成**
   - LLM: 报告模板管理
   - LLM: 报告生成
   - LLM: 数据分析分析
      1. 缺失值处理
         - 检测缺失值：识别数据中的NaN或None值。
         - 删除缺失值：删除包含缺失值的行或列。
         - 填补缺失值：使用均值、中位数、众数、前后值、插值或自定义值方法填补缺失值。
      2. 重复值处理
         - 检测重复值（值匹配或语义匹配）：识别重复的行或列。
         - 删除重复值：删除重复的行或列，保留唯一记录。
      3. 数据格式标准化
         - 日期格式化：统一日期格式。
         - 字符串格式化：统一字符串的大小写、修剪空白字符等。
         - 数值格式化：将数值统一到同一单位或范围。
      4. 异常值处理
         - 检测异常值：使用统计方法或规则识别异常值。
         - 处理异常值：删除、替换或校正异常值。
      5. 数据类型转换
         - 数据类型检测：检测数据类型是否正确。
         - 数据类型转换：将数据转换为所需的数据类型，如字符串转日期、浮点数转整数等。
      6. 噪声数据处理
         - 去除噪声：移除无意义的字符、标点符号等。
         - 数据校验：使用规则或正则表达式验证数据的格式和内容。
      7. 数据分组与聚合
         - 数据分组：基于一个或多个字段对数据进行分组。
         - 数据聚合：对分组数据进行统计汇总，如求和、平均值等。
      8. 复杂字符串处理
         - 字符串提取：从字符串中提取特定模式的数据。
         - 字符串替换：替换字符串中的特定字符或模式。
      9. 多条件数据清洗
         - 条件过滤：基于复杂条件过滤数据。
         - 条件更新：基于条件更新数据的值。
      10. 数据校验
         - 格式校验：校验数据的格式是否符合规范。
         - 逻辑校验：校验数据的逻辑是否符合业务规则。
   - LLM: 持久化智能导入返回的ID **完成**
   - LLM: 智能导入可维护更新频率 **完成**
   - Workflow: Docker 部署 **进行中**
   - 模型树: 拖拽排序 **完成**
   - 模型树: 创建目录 **完成**
   - 提问建表: 持久化会话数据
   - 提问建表: 优化选择模型范围操作体验 **完成**
   - 语义检索: 语义检索维护页面 **完成**
   - 语义检索: 把“字段”标记为“可语义检索” **完成**
   - 语义检索: 把“字段组合”标记为“可语义检索” **完成**
   - 语义检索: 对"指定标记字段"进行语义检索 **完成**
   - 语义检索: 对"指定标记字段组合"进行语义检索 **完成**
   - 语义检索: 对"所有标记字段"进行全局检索 **进行中**
   - 语义检索: 定时推送标记数据集 **完成**
   - 智能表单: 自动推荐内容值
   - 数据导入: 字段映射时自动根据AI的建议自动匹配映射
   - 表结构定义: 可配置外键关联

### 平台
   - 【未开始】V: 门户卡片化
   - 【未开始】V: 门户卡片可配置
   - 【完成】V: 小数精度显示问题
   - 【暂缓】V: 前端导出规则不要把隐藏的字段也导出来 (项目不急)
