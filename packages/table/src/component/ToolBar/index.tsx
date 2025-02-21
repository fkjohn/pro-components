import React, { useEffect } from 'react';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { SearchProps } from 'antd/lib/input';
import { ColumnType } from 'antd/lib/table';
import { useIntl, IntlType } from '@ant-design/pro-provider';
import ListToolBar, { ListToolBarProps } from '../ListToolBar';
import ColumnSetting from '../ColumnSetting';
import './index.less';
import FullScreenIcon from './FullscreenIcon';
import DensityIcon from './DensityIcon';
import Container from '../../container';
import { ActionType } from '../../typing';

export interface OptionConfig {
  density?: boolean;
  fullScreen?: OptionsType;
  reload?: OptionsType;
  setting?: boolean;
  search?: (SearchProps & { name?: string }) | boolean;
}

export type OptionsType =
  | ((e: React.MouseEvent<HTMLSpanElement>, action?: ActionType) => void)
  | boolean;

export interface ToolBarProps<T = unknown> {
  headerTitle?: React.ReactNode;
  tooltip?: string;
  /**
   * @deprecated 你可以使用 tooltip，这个更改是为了与 antd 统一
   */
  tip?: string;
  toolbar?: ListToolBarProps;
  toolBarRender?: (
    action: ActionType | undefined,
    rows: {
      selectedRowKeys?: (string | number)[];
      selectedRows?: T[];
    },
  ) => React.ReactNode[];
  action?: React.MutableRefObject<ActionType | undefined>;
  options?: OptionConfig | false;
  selectedRowKeys?: (string | number)[];
  selectedRows?: T[];
  className?: string;
  onSearch?: (keyWords: string) => void;
  columns: ColumnType<T>[];
  editableUtils: any;
}

function getButtonText({
  intl,
}: OptionConfig & {
  intl: IntlType;
}) {
  return {
    reload: {
      text: intl.getMessage('tableToolBar.reload', '刷新'),
      icon: <ReloadOutlined />,
    },
    density: {
      text: intl.getMessage('tableToolBar.density', '表格密度'),
      icon: <DensityIcon />,
    },
    setting: {
      text: intl.getMessage('tableToolBar.columnSetting', '列设置'),
      icon: <SettingOutlined />,
    },
    fullScreen: {
      text: intl.getMessage('tableToolBar.fullScreen', '全屏'),
      icon: <FullScreenIcon />,
    },
  };
}

/**
 * 渲染默认的 工具栏
 * @param options
 * @param className
 */
function renderDefaultOption<T>(
  options: ToolBarProps<T>['options'],
  defaultOptions: OptionConfig & {
    intl: IntlType;
  },
  columns: ColumnType<T>[],
) {
  if (!options) {
    return null;
  }
  return Object.keys(options)
    .filter((item) => item)
    .map((key) => {
      const value = options[key];
      if (!value) {
        return null;
      }
      if (key === 'setting') {
        return <ColumnSetting columns={columns} key={key} />;
      }
      if (key === 'fullScreen') {
        return (
          <span key={key} onClick={value === true ? defaultOptions[key] : value}>
            <FullScreenIcon />
          </span>
        );
      }
      const optionItem = getButtonText(defaultOptions)[key];
      if (optionItem) {
        return (
          <span
            key={key}
            onClick={() => {
              if (value && defaultOptions[key] !== true) {
                if (value !== true) {
                  value();
                  return;
                }
                defaultOptions[key]();
              }
            }}
          >
            <Tooltip title={optionItem.text}>{optionItem.icon}</Tooltip>
          </span>
        );
      }
      return null;
    })
    .filter((item) => item);
}

function ToolBar<T>({
  headerTitle,
  tooltip,
  toolBarRender,
  action,
  options: propsOptions,
  selectedRowKeys,
  selectedRows,
  toolbar,
  onSearch,
  columns,
  ...rest
}: ToolBarProps<T>) {
  const defaultOptions = {
    reload: () => action?.current?.reload(),
    density: true,
    setting: true,
    search: false,
    fullScreen: () => action?.current?.fullScreen?.(),
  };
  const counter = Container.useContainer();
  const options =
    propsOptions !== false
      ? {
          ...defaultOptions,
          ...(propsOptions || {
            fullScreen: false,
          }),
        }
      : false;

  const intl = useIntl();
  const optionDom =
    renderDefaultOption<T>(
      options,
      {
        ...defaultOptions,
        intl,
      },
      columns,
    ) || [];
  // 操作列表
  const actions = toolBarRender
    ? toolBarRender(action?.current, { selectedRowKeys, selectedRows })
    : [];
  const getSearchConfig = (search: OptionConfig['search']) => {
    if (!search) return false;

    /**
     * 受控的value 和 onChange
     */
    const defaultSearchConfig = {
      value: counter.keyWords,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => counter.setKeyWords(e.target.value),
    };

    if (search === true) return defaultSearchConfig;

    return {
      ...defaultSearchConfig,
      ...search,
    };
  };

  useEffect(() => {
    if (counter.keyWords === undefined) {
      onSearch?.('');
    }
  }, [counter.keyWords]);
  return (
    <ListToolBar
      title={headerTitle}
      tip={tooltip || rest.tip}
      search={options && getSearchConfig(options.search)}
      onSearch={onSearch}
      actions={actions}
      settings={optionDom}
      {...toolbar}
    />
  );
}

export default ToolBar;
