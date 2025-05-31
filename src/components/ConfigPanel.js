import React from 'react';
import Select from './Select';

const ConfigPanel = ({
  userConfig,
  updateUserConfig,
  step1Enabled,
  getServerListOptions,
  professionListOptions,
  sideListOptions,
  onNextStep
}) => {
  return (
    <div className="panel-static" style={{ marginTop: -20 }}>
      <div className="panel-title">请选择专业、服务器、阵营</div>
      <div className="panel-body">
        <div className="config-staic-form">
          <p className="form-label">专业</p>
          <Select
            value={userConfig.professionType}
            className="form-input select-primary"
            placeholder="选择专业"
            data={professionListOptions}
            onChange={value => updateUserConfig('professionType', value)}
          />
          <p className="form-label">服务器</p>
          <Select
            className="form-input select-primary"
            placeholder="选择服务器, 可使用关键字检索"
            data={getServerListOptions()}
            value={userConfig.server}
            search={true}
            onChange={value => updateUserConfig('server', value)}
          />
          <p className="form-label">阵营</p>
          <Select
            className="form-input select-primary"
            placeholder="选择阵营"
            data={sideListOptions}
            value={userConfig.side}
            onChange={value => updateUserConfig('side', value)}
          />
        </div>
      </div>
      <div className="panel-footer justify-center">
        {/* <div className="btn">上一步</div> */}
        <div
          className={step1Enabled() ? "btn btn-primary" : "btn btn-disabled"}
          onClick={onNextStep}
        >
          下一步
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel; 