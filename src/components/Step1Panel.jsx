import React from 'react';
import Select from './Select';

const Step1Panel = ({ state, dispatch, ACTIONS }) => {
  const step1Enabled = () => {
    const { professionType, server, side } = state.userConfig;
    return (professionType || professionType === 0) && (server || server === 0) && (side || side === 0);
  };

  return (
    <div className="panel-static" style={{ marginTop: -20 }}>
      <div className="panel-title">请选择专业、服务器、阵营</div>
      <div className="panel-body">
        <div className="config-staic-form">
          <p className="form-label">专业</p>
          <Select value={state.userConfig.professionType} className="form-input select-primary" placeholder="选择专业" data={window.professionListOptions} onChange={
            (value) => {
              dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { professionType: value } });
            }
          }
          />
          <p className="form-label">服务器</p>
          <Select
            className="form-input select-primary"
            placeholder="选择服务器, 可使用关键字检索"
            data={window.getServerListOptions()}
            value={state.userConfig.server}
            search={true}
            onChange={
              (value) => {
                dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { server: value } });
              }
            } />
          <p className="form-label">阵营</p>
          <Select
            className="form-input select-primary"
            placeholder="选择阵营"
            data={window.sideListOptions}
            value={state.userConfig.side}
            onChange={
              (value) => {
                dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { side: value } });
              }
            } />
        </div>
      </div>
      <div className="panel-footer justify-center">
        <div className={step1Enabled() ? "btn btn-primary" : "btn btn-disabled"} onClick={
          () => {
            if (step1Enabled()) {
              dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { step: 2 } });
            }
          }
        }>下一步</div>
      </div>
    </div>
  );
};

export default Step1Panel; 