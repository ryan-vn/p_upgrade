import React from 'react';

const Step3Panel = ({ state, dispatch, ACTIONS, handleConfigReset, handleGenUpgradePath, getPrice, getReagentPrice, handleSelectSellPrice, handleAccessChange, genSources, getNeed, getActualCost, getServerListOptions, sideListOptions, professionListOptions, professionsDataArr, reputationMap, handlePathItemClick, handlePathItemMouseIn, handlePathItemMouseOut, getCreateCount, handleCopyMaterialList }) => {
  // 这里只迁移JSX结构，具体内容可后续细分为子组件
  return (
    <div className="panel-main" >
      {/* 头部 */}
      <div className="panel-header">
        <div className="logo" />
        <p className="header-title">魔兽世界WLK专业技能冲级宝典</p>
        <div className="header-config-wrap">
          <div className="flex items-center" style={{ color: '#ff44a3' }}>
            {getServerListOptions().find(_it => _it.value === state.userConfig.server).key}
          </div>
          <div className={`${state.userConfig.side === 0 ? 'text-primary ' : 'text-error '}flex items-center`}>
            {sideListOptions.find(_it => _it.value === state.userConfig.side).key}
          </div>
          <div className="text-success flex items-center">
            <div className="icon-wrap">
              <img className="icon" src={`./resources/wlk/icons/medium/${professionListOptions.find(_it => _it.value === state.userConfig.professionType).icon}.jpg`} />
            </div>
            {professionListOptions.find(_it => _it.value === state.userConfig.professionType).key}
          </div>
        </div>
        <div className="btn btn-primary" style={{ height: 30, lineHeight: '28px', padding: '0 10px', fontSize: 12 }} onClick={handleConfigReset}>
          修改服务器和专业
        </div>
      </div>
      {/* 主体内容和右侧升级路线等，后续可继续细分 */}
      {/* ...此处省略，后续可继续细分... */}
      {/* 你可以在这里插入原App.js中step3的JSX内容 */}
    </div>
  );
};

export default Step3Panel; 