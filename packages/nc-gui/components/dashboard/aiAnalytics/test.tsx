import 'react-quill/dist/quill.snow.css'

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import axios from 'axios'
import ReactQuill from 'react-quill'

import { useTheme } from '@v-act/theme'
import {
  ChevronRightIcon,
  ExpandMoreIcon,
  SearchIcon,
} from '@v-act/vendor-mui-base'
// import Linkpanel from './Linkpanel'
import {
  Box,
  IconButton,
  InputBase,
  TreeItem,
  TreeView,
  styled,
} from '@v-act/vendor-mui-material'
// import ReactQuill, { Quill } from 'react-quill'
import { Quill } from '@v-act/vendor-react-quill'
import { ScopeManager as scopeManager } from '@v-act/vjs.framework.extension.platform.interface.scope'
import { uuid } from '@v-act/vjs.framework.extension.util.uuid'

import { ExpressionEditor } from '../expressionEditor'
import { loaderData } from '../getJsData'
import {
  fn,
  functionTree,
  paramMetaTree,
  testDemo,
} from './testData'
import { TranslatorWrapper } from './TranslatorWrapper'

export interface JGRichTextEditorProps {
  /**
   * 实体名
   */
  tablename?: string | null
  /**
   * 字段名
   */
  columnname?: string | null
  /**
   * 控件对象
   */
  control?: any
  /**
   * 默认值
   */
  defaultValue?: string
  /**
   * 实体上下文
   */
  entityContext: any
  /**
   * 只读属性
   */
  readOnly?: boolean
  /**
   * 获取焦点
   */
  focus?: boolean
  /**
   * 值改变事件
   */
  handleValue: (e?: any) => void
  /**
   * 获取焦点事件
   */
  onEnter?: (e?: any) => void
  /**
   * 键盘摁下事件
   */
  onKeyDown?: (e?: any) => void
  /**
   * 失去焦点事件
   */
  onLeave?: (e?: any) => void
  /**
   * 值改变后事件
   */
  onValueChanged?: (e?: any) => void
}

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  'background': ' #fff',
  'border': '1px solid #c0c0c0',
  'height': '28px',
  'width': '100%',
  'color': 'inherit',
  'fontSize': '14px !important',
  '& .MuiInputBase-input': {
    paddingLeft: '9px',
    transition: theme.transitions.create('width'),
    width: '100%'
  }
}))

const SearchComponent = memo((props: any) => {
  const searchVal = useRef<any>(props.searchVal || '')
  return (
    <StyledInputBase
      inputProps={{ 'aria-label': 'search' }}
      endAdornment={
        <IconButton sx={{ marginRight: '3px', padding: '6px 8px' }}>
          <SearchIcon
            sx={{ fontSize: '18px' }}
            onClick={() => {
              props.handleChange(searchVal.current)
            }}
          />
        </IconButton>
      }
      onKeyDown={(e) => {
        if (e.keyCode === 13) props.handleChange(searchVal.current)
      }}
      onChange={(e) => {
        searchVal.current = e.target.value
      }}
      defaultValue={searchVal.current}
    />
  )
})

let editorInstance: any = null
let isRefreshStoredContent = true
let isObservered = false
const typeMap = {
  'entity': '实体',
  'text': '字符串',
  'number': '小数',
  'longDate': '日期时间',
  'boolean': '布尔',
  '-1': '不定类型',
  'integer': '整数'
}
const JGRichTextEditor = (props: JGRichTextEditorProps) => {
  const {
    tablename,
    columnname,
    defaultValue,
    entityContext,
    handleValue,
    readOnly,
    onEnter,
    onKeyDown,
    onLeave,
    onValueChanged,
    focus,
    control,
    ...resprops
  } = props
  const VActTheme = useTheme()
  const isIgnoreRef = useRef<boolean>(false)

  let refs: any = useRef(null)
  let containerRef: any = useRef(null)
  const value = entityContext.getFieldValue(tablename, columnname)
  const [defulValue, setDefValue] = useState<any>(value ? value : '')
  let host: string = `${location.protocol}//${location.host}/` // 上传图片的地址信息

  //编辑器
  let entityData = entityContext?.getEntityDatas(tablename) //实体数据
  const extraProperties = control?.properties?.extraProperties //扩展属性
  const extraPropertiesObj = extraProperties ? JSON.parse(extraProperties) : null
  const [isEditor, setIsEditor] = useState(false)
  const [isMonaco, setIsMonaco] = useState(false)
  const [editorEntityData, setEditorEntityData] = useState('')
  const [hasDriverId, setHasDriverId] = useState('')
  const [fnDocumentation, setFnDocumentation] = useState<any>(null)
  //基本元素数据
  const [expandedToParamMetaTreeData, setExpandedToParamMetaTreeData] = useState<string[]>([])
  const [paramMetaTreeData, setParamMetaTreeData] = useState<any[]>([]) //数据
  const [searchResToParamMetaTreeData, setSearchResToParamMetaTreeData] = useState<string>('') //搜索结果
  const [searchValToParamMetaTreeData, setSearchValToParamMetaTreeData] = useState<string>('') //搜索值
  const [selectedParamMetaTreeDataId, setSelectedParamMetaTreeDataId] = useState<string>('') //选择
  //变量数据
  const [expandedToVariable, setExpandedToVariable] = useState<string[]>([])
  const [variableList, setVariableList] = useState<any>([])
  const [searchResToVariableList, setSearchResToVariableList] = useState<string>('')
  const [searchValToVariableList, setSearchValToVariableList] = useState<string>('')
  const [selectedVariableListId, setSelectedVariableListId] = useState<string>('')
  //函数树
  const [expandedToFunctionList, setexpandedToFunctionList] = useState<string[]>([])
  const [functionList, setFunctionList] = useState<any[]>([])
  const [searchResToFn, setSearchResToFn] = useState<any>('')
  const [searchValToFn, setSearchValToFn] = useState<any>('')
  const [selectedFnId, setSelectedFnId] = useState<string>('')

  const initData = () => {
    if (entityData && entityData?.length) {
      let paramMetaTreeData = entityData[0]?.paramMetaTree ? JSON.parse(entityData[0]?.paramMetaTree) : paramMetaTree
      paramMetaTreeData && setParamMetaTreeData(paramMetaTreeData?.children || [])
      let functionTreeData = entityData[0]?.functionTree ? JSON.parse(entityData[0]?.functionTree) : functionTree
      functionTreeData && setFunctionList(functionTree?.children || [])
    }
  }

  useEffect(() => {
    initData()
    const hasMonaco = () => {
      let timerId = setInterval(() => {
        if (window['monaco']) {
          clearInterval(timerId)
          setIsMonaco(true)
        }
      }, 10)
    }
    const loadEditor = () => {
      setIsEditor(true)
      const customScript = document.querySelector('script[data-is-loader-monaco="monaco"]')
      if (!customScript) {
        const blob = new Blob([loaderData], { type: 'text/javascript' })
        const url = URL.createObjectURL(blob)
        const script = document.createElement('script')
        script.src = `${url}`
        script.setAttribute('data-is-loader-monaco', 'monaco')
        script.onload = async () => {
          require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs' } })
          require(['vs/editor/editor.main'], () => {
            console.log('引入成功')
          })
        }
        document.body.appendChild(script)
      }
      hasMonaco()
    }
    extraProperties && extraPropertiesObj?.isEditor && loadEditor()

    // 设计平台属性编辑器图片回显兼容处理（相对路径）
    //@ts-ignore
    if (window.location.host === '' && window?.v3dev && typeof window.v3dev.openFileDialog === 'function') {
      const BlockEmbed = Quill.import('blots/block/embed')
      class ImageBlot extends BlockEmbed {
        static create(value) {
          let node = super.create()
          node.setAttribute('src', value.url)
          // node.setAttribute('width', value.width)
          // node.setAttribute('height', value.height)
          return node
        }
        static value(node) {
          return {
            url: node.getAttribute('src')
            // width: node.getAttribute('width'),
            // height:node.getAttribute('height')
          }
        }
      }
      ImageBlot.blotName = 'image'
      ImageBlot.tagName = 'img'
      Quill.register(ImageBlot)
    }
  }, [])

  useEffect(() => {
    //监听窗体关闭
    const listenWindowClosed = () => {
      const winScope = scopeManager.getScope(entityContext.instanceId)
      winScope?.on(scopeManager.EVENTS.DESTROY, function () {
        if (winScope._vactWindowInput_?.viewModel === 'Dialog' && !winScope.windowClosedFlag) {
          isObservered = false
        }
      })
    }
    //对实体进行监听
    const listenEntity = () => {
      if (tablename && !isObservered) {
        isObservered = true
        let listener: any = (event: any) => {
          editorInstance &&
            event.changedData?.value &&
            isRefreshStoredContent &&
            editorInstance.refreshDisplayContent(event.changedData.value)
          isRefreshStoredContent = true
        }
        entityContext
          .findEntityContextByTableName(tablename)
          .registerCurrentRecordObserverHandler(tablename, '', listener, [columnname])
      }
    }
    const createEditor = () => {
      let paramMetaDefinition = entityData[0]?.paramMetaDefinition
        ? JSON.parse(entityData[0]?.paramMetaDefinition)
        : testDemo
      let functionDefinition = entityData[0]?.functionDefinition ? JSON.parse(entityData[0]?.functionDefinition) : fn
      // 初始化编辑器选项
      const editorOptions = {
        theme: 'myCustomTheme',
        onSave: function (savedContent) {},
        onChange: function (displayContent, storageContent, cursorLineNumber, cursorColumn) {},
        onBlur: function (displayContent, storageContent, cursorLineNumber, cursorColumn) {
          console.log('onBlur value storageContent-displayContent:', { storageContent, displayContent })
          setEditorEntityData(displayContent)
          isRefreshStoredContent = false
          if (entityData.length && entityData[0]?.id) {
            entityContext?.setCurrentRecord(entityData[0].id, tablename)
            entityContext.setFieldValues(tablename, { storedValue: storageContent, displayValue: displayContent })
          } else {
            entityContext.insertRecords({
              code: tablename,
              records: [
                {
                  storedValue: storageContent,
                  id: uuid.generate(),
                  displayValue: displayContent
                }
              ],
              position: 'AFTER'
            })
          }
        },
        dynamicEditorData: {
          keywords: [
            { label: 'IF', documentation: 'Conditionally returns a value based on a boolean test.' },
            { label: 'AND', documentation: 'Returns TRUE if all conditions are TRUE.' },
            { label: 'OR', documentation: 'Returns TRUE if any condition is TRUE.' },
            { label: 'NOT', documentation: 'Reverses the logic of its argument.' }
          ],
          functions: functionDefinition
        },
        dynamicUserData: {
          variables: [],
          systemVariables: [],
          sheets: [],
          customVariableTypes: {},
          ...paramMetaDefinition
        },
        editorOptions: {
          fontSize: 14,
          minimap: { enabled: false }
        },
        customToolbarButtons: [
          {
            label: 'Custom Action',
            action: () => alert('Custom button clicked!')
          }
        ]
      }
      let displayContent = entityData.length ? entityData[0].displayValue : '' //编辑器显示初始值
      let storedContent = entityData.length ? entityData[0].storedValue : '' //编辑器存储初始值
      editorInstance = new ExpressionEditor('editor-container', storedContent, displayContent, editorOptions)
      setEditorEntityData(editorInstance.editor.getValue())
    }
    if (isMonaco && window['monaco']) {
      listenWindowClosed()
      listenEntity()
      createEditor()
    }
  }, [isMonaco])

  /**
   * 焦点获取
   */
  useEffect(() => {
    const quill = refs.current?.getEditor()
    if (quill && focus && !quill.hasFocus()) {
      const length = quill.getLength()
      quill.setSelection(length)
    }
  }, [focus])

  useEffect(() => {
    setDefValue(value ? value : '')
  }, [value])

  const blurHandler = (e: any) => {
    /**
     * 设计平台环境中 会出现选中文本范围信息丢失的问题
     *  在失焦中调用getSelection接口获取一下编辑器选中信息能恢复QAQ
     */

    refs?.current?.getEditor().getSelection()

    if (e.relatedTarget && e.relatedTarget.className === 'ql-link' && containerRef.current.contains(e.relatedTarget)) {
      isIgnoreRef.current = true
    }

    if (onLeave && typeof onLeave === 'function') {
      onLeave()
    }
    if (!e.relatedTarget || !containerRef.current.contains(e.relatedTarget)) {
      !isIgnoreRef.current && handleValue({ columnName: defulValue })
      isIgnoreRef.current = false
    }
    // 设置聚焦属性为false
    control.properties.focus = false
  }

  const focusHandler = () => {
    if (typeof onEnter === 'function') {
      onEnter()
    }
    // 设置聚焦属性为true
    control.properties.focus = true
  }

  const imageUploadHandler = function (Environment: 'Default' | 'DesignPlatform') {
    /**
     * 设计平台图片上传回调 工具端调用
     * @param {String} data
     */
    const imageUploadCallback = function (data: string) {
      try {
        if (!data) {
          throw new Error('上传图片发生错误：返回的图片数据为空')
        }
        const imagesArr = JSON.parse(data)
        if (imagesArr.length > 0) {
          let quill = refs?.current?.getEditor() // 获取到编辑器本身
          imagesArr.forEach((image) => {
            const { value } = image
            // 拼接图片src
            const imageSrc = `./itop/resources/${value}`

            // 将图片设置到编辑器中
            const cursorPosition = quill.getSelection().index // 获取当前光标位置
            quill.insertEmbed(cursorPosition, 'image', {
              url: imageSrc
            })
            quill.setSelection(cursorPosition + 1) // 设置光标位置+1
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    switch (Environment) {
      case 'DesignPlatform': {
        window.v3dev.openFileDialog('*.gif;*.jpg;*.jpeg;*.bmp;*.jfif;*.png;', imageUploadCallback)
        break
      }
      case 'Default': {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
          if (input.files) {
            Array.from(input.files).forEach((item) => {
              let file: any = input.files[0]
              let formData = new FormData()
              formData.append('image', file)
              axios({
                method: 'POST',
                data: formData,
                url: `${host}itop/common/ueditor/dialogs/image/module-operation!executeOperation?operation=FileUploadForRichText&encode=utf-8`
              })
                .then((res) => {
                  if (res.data.state === 'SUCCESS') {
                    let quill = refs?.current?.getEditor() // 获取到编辑器本身
                    const cursorPosition = quill.getSelection().index // 获取当前光标位置
                    const link = host + res.data.url // 图片src
                    quill.insertEmbed(cursorPosition, 'image', link) // 插入图片
                    quill.setSelection(cursorPosition + 1) // 设置光标位置+1
                  }
                })
                .catch((e) => {
                  throw new Error('上传图片出现错误', e)
                })
            })
          }
        }
        break
      }
    }
  }

  /**
   * 自定义图片上传
   */
  const imageHandler = () => {
    isIgnoreRef.current = true
    //@ts-ignore
    if (window.location.host === '' && window?.v3dev && typeof window.v3dev.openFileDialog === 'function') {
      imageUploadHandler('DesignPlatform')
    } else {
      imageUploadHandler('Default')
    }
  }

  // 引入字体并添加到白名单
  const Font = Quill.import('formats/font')
  const fonts = ['Default', 'SimSun', 'SimHei', 'KaiTi', 'FangSong', 'monospace', 'serif', 'consolas']
  Font.whitelist = fonts
  Quill.register(Font, true)

  const modules: any = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'], // 加粗，斜体，下划线，删除线
          [{ header: '1' }, { header: '2' }], // 几级标题
          [
            {
              background: [
                'rgb(  0,   0,   0)',
                'rgb(230,   0,   0)',
                'rgb(255, 153,   0)',
                'rgb(255, 255,   0)',
                'rgb(  0, 138,   0)',
                'rgb(  0, 102, 204)',
                'rgb(153,  51, 255)',
                'rgb(255, 255, 255)',
                'rgb(250, 204, 204)',
                'rgb(255, 235, 204)',
                'rgb(255, 255, 204)',
                'rgb(204, 232, 204)',
                'rgb(204, 224, 245)',
                'rgb(235, 214, 255)',
                'rgb(187, 187, 187)',
                'rgb(240, 102, 102)',
                'rgb(255, 194, 102)',
                'rgb(255, 255, 102)',
                'rgb(102, 185, 102)',
                'rgb(102, 163, 224)',
                'rgb(194, 133, 255)',
                'rgb(136, 136, 136)',
                'rgb(161,   0,   0)',
                'rgb(178, 107,   0)',
                'rgb(178, 178,   0)',
                'rgb(  0,  97,   0)',
                'rgb(  0,  71, 178)',
                'rgb(107,  36, 178)',
                'rgb( 68,  68,  68)',
                'rgb( 92,   0,   0)',
                'rgb(102,  61,   0)',
                'rgb(102, 102,   0)',
                'rgb(  0,  55,   0)',
                'rgb(  0,  41, 102)',
                'rgb( 61,  20,  10)'
              ]
            }
          ],
          [
            {
              color: [
                'rgb(  0,   0,   0)',
                'rgb(230,   0,   0)',
                'rgb(255, 153,   0)',
                'rgb(255, 255,   0)',
                'rgb(  0, 138,   0)',
                'rgb(  0, 102, 204)',
                'rgb(153,  51, 255)',
                'rgb(255, 255, 255)',
                'rgb(250, 204, 204)',
                'rgb(255, 235, 204)',
                'rgb(255, 255, 204)',
                'rgb(204, 232, 204)',
                'rgb(204, 224, 245)',
                'rgb(235, 214, 255)',
                'rgb(187, 187, 187)',
                'rgb(240, 102, 102)',
                'rgb(255, 194, 102)',
                'rgb(255, 255, 102)',
                'rgb(102, 185, 102)',
                'rgb(102, 163, 224)',
                'rgb(194, 133, 255)',
                'rgb(136, 136, 136)',
                'rgb(161,   0,   0)',
                'rgb(178, 107,   0)',
                'rgb(178, 178,   0)',
                'rgb(  0,  97,   0)',
                'rgb(  0,  71, 178)',
                'rgb(107,  36, 178)',
                'rgb( 68,  68,  68)',
                'rgb( 92,   0,   0)',
                'rgb(102,  61,   0)',
                'rgb(102, 102,   0)',
                'rgb(  0,  55,   0)',
                'rgb(  0,  41, 102)',
                'rgb( 61,  20,  10)'
              ]
            }
          ],
          [{ script: 'sub' }, { script: 'super' }], // 下角标，上角标
          [{ list: 'ordered' }, { list: 'bullet' }], // 有序列表，无序列表
          [{ indent: '-1' }, { indent: '+1' }], // 缩进
          [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
          [{ font: fonts }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
          ['blockquote', 'code-block'], //引用，代码块
          [{ align: [] }, { direction: 'rtl' }], // 文本对齐方式 & 文本输入方向
          ['clean'], // 清除样式,
          ['link', 'image'] // 上传图片
        ],
        handlers: {
          image: imageHandler
          // link: openLinkpanel
        }
      }
    }),
    []
  )
  const changeHandler = (e) => {
    setDefValue(e)
  }

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'script',
    'sub',
    'super',
    'bullet',
    'indent',
    'link',
    'image',
    'align',
    'size',
    'color',
    'background',
    'direction',
    'font'
  ]

  const keyDownHandler = (e) => {
    if (onKeyDown && typeof onKeyDown === 'function') {
      onKeyDown()
    }
  }

  //基本元素树的滚动
  useEffect(() => {
    if (searchResToParamMetaTreeData) {
      const element = document.getElementById(searchResToParamMetaTreeData)
      console.log('element', element)
      element &&
        setTimeout(() => {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }, 300)
    }
  }, [searchResToParamMetaTreeData])
  //点击基本元素树
  const handleClickParamMetaItem = (nodes: any) => {
    setSelectedVariableListId('')
    setSelectedParamMetaTreeDataId(nodes.id)
    setHasDriverId('')
    setVariableList([])
    if (nodes?.children && nodes?.children.length) {
      let varibleData = nodes.isEndExpand
        ? nodes?.children.filter((item) => true)
        : nodes?.children.filter(
            (item) =>
              (item.type === 'variable' && !item.children.length) ||
              (item.type === 'variable' && item.children.length && !item.isEndExpand)
          )
      if (nodes.type === 'variable') {
        varibleData.length && setHasDriverId(nodes.id)
        varibleData.unshift({
          id: nodes.id,
          code: nodes.code,
          name: nodes.name,
          type: nodes.type,
          displayValue: nodes.displayValue,
          storedValue: nodes.storedValue,
          children: []
        })
      }
      console.log('varibleData', varibleData)
      setVariableList(varibleData)
    }
  }
  //渲染基本元素树
  const renderParamMetaTree = (nodes: any, index: number = 1) => (
    <TreeItem
      id={nodes.id}
      key={nodes.id}
      nodeId={nodes.id}
      label={nodes.name}
      className={`tree-item-${index}`}
      sx={{
        'user-select': 'none',
        '& .Mui-selected': { backgroundColor: 'transparent !important' },
        '> div:first-child': {
          height: '23px',
          margin: '2px 0',
          backgroundColor: `${
            [searchResToParamMetaTreeData, selectedParamMetaTreeDataId].includes(nodes.id)
              ? '#c0e1fd !important'
              : 'transparent !important'
          }`
        },
        '& .MuiTreeItem-content:hover': { backgroundColor: '#d7ebfd !important' },
        '& .MuiTreeItem-content .MuiTreeItem-label': {
          fontSize: '14px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          color: '#333'
        },
        '.MuiTreeItem-group': {
          'margin': '0 !important',
          '.MuiTreeItem-content': {
            paddingLeft: `${17 * index}px !important`
          }
        }
      }}
      onClick={(e: any) => {
        e.stopPropagation()
        setSearchResToParamMetaTreeData('')
        handleClickParamMetaItem(nodes)
      }}
    >
      {nodes?.children &&
        Array.isArray(nodes?.children) &&
        nodes?.children.length &&
        nodes?.children.some((nodesItem) => nodesItem?.children?.length) &&
        !nodes?.isEndExpand &&
        nodes.children.map((nodesChildrenItem) => {
          if (nodesChildrenItem?.children?.length) {
            return renderParamMetaTree(nodesChildrenItem, index + 1)
          } else {
            return null
          }
        })}
    </TreeItem>
  )

  //函数树的滚动
  useEffect(() => {
    if (searchResToFn) {
      const element = document.getElementById(searchResToFn)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }, 300)
      }
    }
  }, [searchResToFn])
  //点击函数树
  const handleClickToFnTree = (node: any) => {
    setSelectedFnId(node.id)
    setSearchResToFn('')
    if (node.type === 'function') {
      setFnDocumentation({
        documentation: node.documentation,
        returnType: `返回值为${typeMap[node.returnType]}`,
        example: node.example
      })
    } else {
      setFnDocumentation(null)
    }
  }
  //双击函数树
  const handleDoubleClikeToFnTree = (node: any) => {
    setSelectedFnId(node.id)
    setSearchResToFn('')
    const regex = /\([^)]*\)/
    let hasReges = regex.test(node.code)
    let displayValue = hasReges ? node.code : `${node.code}()`
    let newValue = `${editorEntityData}${displayValue}`
    console.log('newValue', newValue)
    editorInstance.refreshDisplayContent(newValue, true)
    setEditorEntityData(newValue)
    setFnDocumentation({
      documentation: node.documentation,
      returnType: `返回值为${typeMap[node.returnType]}`,
      example: node.example
    })
  }
  //渲染函数树
  const renderFunctionTree = (nodes: any, index: number = 1) => (
    <TreeItem
      id={nodes.id}
      key={nodes.id}
      nodeId={nodes.id}
      label={nodes.returnType ? `${nodes.code}-${typeMap[nodes.returnType]}` : `${nodes.code}`}
      className={`tree-item-${index}`}
      sx={{
        'user-select': 'none',
        '& .Mui-selected': { backgroundColor: 'transparent !important' },
        '> div:first-child': {
          height: '23px',
          margin: '2px 0',
          backgroundColor: `${
            [searchResToFn, selectedFnId].includes(nodes.id) ? '#c0e1fd !important' : 'transparent !important'
          }`
        },
        '& .MuiTreeItem-content:hover': { backgroundColor: '#d7ebfd !important' },
        '& .MuiTreeItem-content .MuiTreeItem-label': {
          fontSize: '14px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          color: '#333'
        },
        '.MuiTreeItem-group': {
          'margin': '0 !important',
          '.MuiTreeItem-content': {
            paddingLeft: `${17 * index}px !important`
          }
        }
      }}
      onClick={(e: any) => {
        e.stopPropagation()
        handleClickToFnTree(nodes)
      }}
      onDoubleClick={(e: any) => {
        e.stopPropagation()
        if (nodes.type === 'function') {
          handleDoubleClikeToFnTree(nodes)
        } else {
          e.preventDefault()
        }
      }}
    >
      {nodes?.children && nodes?.children.length
        ? nodes.children.map((node) => renderFunctionTree(node, index + 1))
        : null}
    </TreeItem>
  )

  //变量树的滚动
  useEffect(() => {
    if (searchResToVariableList) {
      const element = document.getElementById(searchResToVariableList)
      element &&
        setTimeout(() => {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }, 300)
    }
  }, [searchResToVariableList])
  //点击变量树
  const handleClickVarIableItem = (node: any) => {
    setSelectedVariableListId(node.id)
  }
  //双击变量树
  const handleDoubleClickVarIableItem = (node: any) => {
    console.log('双击变量', node)
    setSelectedVariableListId(node.id)
    setSelectedFnId(node.id)
    let newValue = `${editorEntityData}${node.displayValue}`
    editorInstance.refreshDisplayContent(newValue, true)
    setEditorEntityData(newValue)
  }
  //渲染变量树
  const renderVariableTree = (nodes: any, index: number = 1) => (
    <TreeItem
      id={nodes.id}
      key={nodes.id}
      nodeId={nodes.id}
      label={nodes.name}
      className={`tree-item-${index}-${nodes.id}`}
      sx={{
        'border-bottom': nodes.id === hasDriverId ? '1px solid #ccc' : 'none',
        'user-select': 'none',
        '& .Mui-selected': { backgroundColor: 'transparent !important' },
        '> div:first-child': {
          height: '23px',
          margin: '2px 0',
          backgroundColor: `${
            [searchResToVariableList, selectedVariableListId].includes(nodes.id)
              ? '#c0e1fd !important'
              : 'transparent !important'
          }`
        },
        '& .MuiTreeItem-content:hover': { backgroundColor: '#d7ebfd !important' },
        '& .MuiTreeItem-content .MuiTreeItem-label': {
          fontSize: '14px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          color: '#333'
        },
        '.MuiTreeItem-group': {
          'margin': '0 !important',
          '.MuiTreeItem-content': {
            paddingLeft: `${17 * index}px !important`
          }
        }
        // '& .MuiTreeItem-iconContainer': {
        //   display:
        //     nodes?.children && Array.isArray(nodes?.children) && nodes?.children.length ? 'flex' : 'none !important'
        // }
      }}
      onClick={() => handleClickVarIableItem(nodes)}
      onDoubleClick={(e: any) => {
        e.stopPropagation()
        if (nodes.type === 'variable') {
          handleDoubleClickVarIableItem(nodes)
        } else {
          e.preventDefault()
        }
      }}
    >
      {nodes?.children && Array.isArray(nodes?.children) && nodes?.children.length
        ? nodes.children.map((nodesChildrenItem) => renderVariableTree(nodesChildrenItem, index + 1))
        : null}
    </TreeItem>
  )

  //基本元素树根据搜索值查询符合条件的值
  const findNodeByNodeNameToParam = (query, data) => {
    for (const item of data) {
      if (item?.name.indexOf(query) > -1) {
        return item
      }
      if (item?.children && item.children.length && !item?.isEndExpand) {
        const result = findNodeByNodeNameToParam(query, item.children)
        if (result) return result
      }
    }
    return null
  }

  //获取第一个符合查询值的值
  const findNodeByNodeName = (query, data, isFn = false) => {
    for (const item of data) {
      if ((isFn ? item?.code : item?.name).indexOf(query) > -1) {
        return item
      }
      if (item?.children && item.children.length > 0) {
        const result = findNodeByNodeName(query, item.children, isFn)
        if (result) {
          return result
        }
      }
    }
    return null
  }

  //递归查询所有父节点
  const findParents = (tree, targetId, path = []) => {
    for (const node of tree) {
      if (node.id === targetId) {
        return path
      }

      if (node?.children && node.children.length > 0) {
        const result = findParents(node.children, targetId, path.concat(node.id))
        if (result) {
          return result
        }
      }
    }
    return null
  }

  return isEditor ? (
    <Box
      className="monaco-editor-main-class"
      sx={{
        width: '100%',
        height: '100%'
      }}
    >
      {isMonaco ? (
        <>
          <div id="editor-container"></div>
          <Box
            className="editor-footer"
            sx={{ height: 'calc(100% - 174px)', display: 'flex', width: '100%', backgroundColor: '#cfddee' }}
          >
            {/* left */}
            <Box
              className="editor-footer-left"
              sx={{
                width: '67%',
                height: '100%'
              }}
            >
              <Box sx={{ paddingLeft: '10px', fontSize: '14px' }}>基本元素</Box>
              <Box sx={{ display: 'flex', width: '100%', marginTop: '3px', height: 'calc(100% - 24px)' }}>
                {/* 基本元素树 */}
                <Box sx={{ marginRight: '5px', width: '50%', height: '100%' }}>
                  <SearchComponent
                    searchVal={searchValToParamMetaTreeData}
                    handleChange={(v) => {
                      setSearchValToParamMetaTreeData(v)
                      if (!v || !v?.trim()) {
                        setSearchResToParamMetaTreeData('')
                        return
                      }
                      let node = findNodeByNodeNameToParam(v, paramMetaTreeData)
                      if (!node) {
                        setSearchResToParamMetaTreeData('')
                        return
                      }
                      let findRes = findParents(paramMetaTreeData, node.id, [])
                      setExpandedToParamMetaTreeData((pre) => {
                        let newArray = [...pre, ...findRes]
                        let uniqueArray = [...new Set(newArray)]
                        return uniqueArray
                      })
                      setSearchResToParamMetaTreeData(node.id)
                      setSelectedParamMetaTreeDataId('')
                      handleClickParamMetaItem(node)
                    }}
                  />
                  <Box sx={{ height: 'calc(100% - 28px)', backgroundColor: '#eff6fd', border: '1px solid #828790' }}>
                    <TreeView
                      aria-label="rich object"
                      defaultCollapseIcon={<ExpandMoreIcon />}
                      defaultExpandIcon={<ChevronRightIcon />}
                      sx={{
                        overflow: 'auto',
                        height: '100%',
                        padding: '5px'
                      }}
                      expanded={expandedToParamMetaTreeData}
                      onNodeToggle={(event: React.SyntheticEvent, nodeIds: string[]) =>
                        setExpandedToParamMetaTreeData(nodeIds)
                      }
                    >
                      {paramMetaTreeData.map((val) => renderParamMetaTree(val, 1))}
                    </TreeView>
                  </Box>
                </Box>
                {/* 变量树 */}
                <Box sx={{ width: '50%', height: '100%' }}>
                  <SearchComponent
                    searchVal={searchValToVariableList}
                    handleChange={(v) => {
                      setSearchValToVariableList(v)
                      if (!v || !v?.trim()) {
                        setSearchResToVariableList('')
                        return
                      }
                      let node = findNodeByNodeName(v, variableList)
                      if (!node) {
                        setSearchResToVariableList('')
                        return
                      }
                      let findRes = findParents(variableList, node.id, [])

                      setExpandedToVariable((pre) => {
                        let newArray = [...pre, ...findRes]
                        let uniqueArray = [...new Set(newArray)]
                        return uniqueArray
                      })
                      setSearchResToVariableList(node.id)
                      setSelectedVariableListId('')
                      // if (!v || !v?.trim()) {
                      //   setSearchResToVariableList('')
                      //   return
                      // }
                      // let node = findNodeByNodeName(v, variableList)
                      // if (!node) {
                      //   setSearchResToVariableList('')
                      //   return
                      // }
                      // setSearchResToVariableList(node.id)
                      // setSelectedVariableListId('')
                    }}
                  />
                  <Box sx={{ height: 'calc(100% - 28px)', backgroundColor: '#eff6fd', border: '1px solid #828790' }}>
                    <TreeView
                      aria-label="rich object"
                      defaultCollapseIcon={<ExpandMoreIcon />}
                      defaultExpandIcon={<ChevronRightIcon />}
                      sx={{
                        overflow: 'auto',
                        height: '100%',
                        padding: '5px'
                      }}
                      expanded={expandedToVariable}
                      onNodeToggle={(event: React.SyntheticEvent, nodeIds: string[]) => setExpandedToVariable(nodeIds)}
                    >
                      {variableList.map((val) => renderVariableTree(val, 1))}
                    </TreeView>
                  </Box>
                  {/* <Box
                    className="fn-list"
                    sx={{
                      height: 'calc(100% - 28px)',
                      backgroundColor: '#eff6fd',
                      border: '1px solid #828790',
                      padding: '5px 0',
                      overflow: 'auto'
                    }}
                  >
                    {variableList.map((variableListItem, index) => {
                      return (
                        <div
                          id={variableListItem.id}
                          className={`${hasDriverId && index === 0 ? 'boder-bottom-style' : ''}  fn-list-item ${
                            [selectedVariableListId, searchResToVariableList].includes(variableListItem.id)
                              ? 'fn-list-item-selected'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedVariableListId(variableListItem.id)
                          }}
                          onDoubleClick={() => {
                             setSelectedVariableListId(variableListItem.id)
                            setSelectedFnId(variableListItem.id)
                            let newValue = `${editorEntityData}${variableListItem.displayValue}`
                            editorInstance.refreshDisplayContent(newValue, true)
                            setEditorEntityData(newValue)
                          }}
                        >
                          {variableListItem.name}
                        </div>
                      )
                    })}
                  </Box> */}
                </Box>
              </Box>
            </Box>
            {/* right */}
            <Box
              className="editor-footer-right"
              sx={{
                width: '33%',
                height: '100%',
                marginLeft: '15px'
              }}
            >
              <Box sx={{ paddingLeft: '10px', fontSize: '14px' }}> 函数</Box>
              <Box sx={{ width: '100%', height: 'calc(100% - 24px)', marginTop: '3px' }}>
                <SearchComponent
                  searchVal={searchValToFn}
                  handleChange={(v) => {
                    setSearchValToFn(v)
                    if (!v || !v?.trim()) {
                      setSearchResToFn('')
                      return
                    }
                    let node = findNodeByNodeName(v, functionList, true)
                    if (!node) {
                      setSearchResToFn('')
                      return
                    }
                    let findRes = findParents(functionList, node.id, [])
                    setexpandedToFunctionList((pre) => {
                      let newArray = [...pre, ...findRes]
                      let uniqueArray = [...new Set(newArray)]
                      return uniqueArray
                    })
                    setSearchResToFn(node.id)
                    setSelectedFnId('')
                  }}
                />
                {/* 函数树 */}
                <Box sx={{ height: 'calc(100% - 178px)', backgroundColor: '#eff6fd', border: '1px solid #828790' }}>
                  <TreeView
                    aria-label="rich object"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{
                      overflow: 'auto',
                      height: '100%',
                      padding: '5px'
                    }}
                    expanded={expandedToFunctionList}
                    onNodeToggle={(event: React.SyntheticEvent, nodeIds: string[]) => {
                      console.log('nodeIds', nodeIds)
                      setexpandedToFunctionList(nodeIds)
                    }}
                  >
                    {functionList.map((val) => renderFunctionTree(val, 1))}
                  </TreeView>
                </Box>
                {/* 说明 */}
                <Box
                  className="documentation"
                  sx={{
                    'height': '145px',
                    'width': '100%',
                    'overflow': 'auto',
                    'background-color': '#ededef',
                    'margin-top': '5px',
                    'border': '1px solid #b1bbd6',
                    'padding': '1px'
                  }}
                >
                  {fnDocumentation?.documentation && <div>{fnDocumentation.documentation}</div>}
                  {fnDocumentation?.returnType && <div>{fnDocumentation.returnType}</div>}
                  {fnDocumentation?.example && <div>{fnDocumentation.example}</div>}
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <></>
      )}
    </Box>
  ) : (
    <Box
      sx={{
        width: '100%',
        height: '100%'
      }}
      onBlur={blurHandler}
      ref={containerRef}
    >
      <TranslatorWrapper style={{ width: '100%', height: '100%' }}>
        <ReactQuill
          style={{
            width: '100%',
            height: '100%',
            padding: '0px',
            overflow: 'unset',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: VActTheme.borderRadiusBase,
            borderColor: VActTheme.borderBaseColor
          }}
          className={'ql-editor'} //组件要加上(className=“ql-editor”)样式类名,否则空格不回显
          ref={refs}
          theme="snow"
          value={defulValue}
          readOnly={readOnly}
          // plainText={plainText}
          // plainTextLength={plainTextLength}
          onKeyDown={keyDownHandler}
          onFocus={focusHandler}
          modules={modules}
          formats={formats}
          onChange={changeHandler}
          bounds={document.querySelector('body') as HTMLElement}
        >
          <div style={{ height: '100%' }} />
        </ReactQuill>
      </TranslatorWrapper>
    </Box>
  )
}

JGRichTextEditor.defaultProps = {
  left: '20px',
  top: '50px',
  width: '300px',
  position: 'absolute',
  focus: false
}

export default JGRichTextEditor
