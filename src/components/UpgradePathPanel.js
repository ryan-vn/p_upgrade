import React from 'react';

const UpgradePathPanel = ({
  pathData,
  userConfig,
  updateUserConfig,
  handleConfigReset,
  getServerListOptions,
  sideListOptions,
  professionListOptions,
  getPrice,
  materialModalShow,
  setMaterialModalShow,
  handleCopyMaterialList,
  getCreateCount,
  getReagentPrice,
  reputationMap,
  handlePathItemClick,
  handlePathItemMouseIn,
  handlePathItemMouseOut,
  highLightItem,
  professionsDataArr,
  loadingGlobal,
  hoverItem
}) => {
  return (
    <div className="panel-main">
      <div className="panel-header">
        <div className="logo" />
        <p className="header-title">魔兽世界WLK专业技能冲级宝典</p>
        <div className="header-config-wrap">
          <div className="flex items-center" style={{ color: '#ff44a3' }}>
            <div className="icon-wrap">
              {/* <img className="icon" src={ImgServer} /> */}
            </div>
            {getServerListOptions().find(_it => _it.value === userConfig.server).key}
          </div>
          <div className={`${userConfig.side === 0 ? 'text-primary ' : 'text-error '}flex items-center`}>
            <div className="icon-wrap">
              {/* <img className="icon" src={userConfig.side === 0 ? ImgLianMeng : ImgBuLuo} /> */}
            </div>
            {sideListOptions.find(_it => _it.value === userConfig.side).key}
          </div>
          <div className="text-success flex items-center">
            <div className="icon-wrap">
              <img className="icon" src={`./resources/wlk/icons/medium/${professionListOptions.find(_it => _it.value === userConfig.professionType).icon}.jpg`} />
            </div>
            {professionListOptions.find(_it => _it.value === userConfig.professionType).key}
          </div>
        </div>
        <div className="btn btn-primary" style={{ height: 30, lineHeight: '28px', padding: '0 10px', fontSize: 12 }} onClick={handleConfigReset}>
          修改服务器和专业
        </div>
        {/* 其他 header 内容略 */}
      </div>
      <div className="panel-body flex">
        <div className="price-table-wrap h-100 overflow-auto">
          <div className="price-table">
            <div className="table-header">
              <div className="table-col">名称</div>
              <div className="table-col">制造材料/单价</div>
              <div className="table-col">点数</div>
              <div className="table-col">生产成本/单次</div>
              <div className="table-col">售价/单价 <span className="text-success">选择出售方式</span></div>
              <div className="table-col">实际成本/单次</div>
              <div className="table-col">图纸 <span className="text-success">选择获取方式</span></div>
            </div>
            {professionsDataArr[userConfig.professionType].map((item, index) => (
              <div key={item.id} className={`table-row row-${index} ${pathData?.data?.find(_it => _it.id === item.id) ? ' active' : ''} ${highLightItem === item.id ? ' high-light' : ''}`}>
                {/* ...省略，照搬原有表格内容... */}
              </div>
            ))}
          </div>
        </div>
        {/* 路线和材料弹窗部分，照搬原有内容... */}
      </div>
      {/* 概率面板、全局 loading、材料弹窗等可继续拆分为独立组件 */}
    </div>
  );
};

export default UpgradePathPanel; 