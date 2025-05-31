import React from 'react';

const Step2Panel = ({ state, dispatch, ACTIONS, handleGenUpgradePath }) => {
  return (
    <div className="panel-static select-none panel-price-list" style={{ width: 800 }}>
      <div className="panel-title">选择价格数据</div>
      <div className="panel-body">
        <div className="config-staic-form" style={{ gridRowGap: 10 }}>
          <p className="form-label">云端价格数据</p>
          {state.loadingPriceData ? (
            <div style={{ padding: 20, textAlign: 'center' }}>正在获取最新价格数据...</div>
          ) : state.priceDataError ? (
            <div style={{ padding: 20, color: 'red', textAlign: 'center' }}>{state.priceDataError}</div>
          ) : state.priceData && Object.keys(state.priceData).length ? (
            <div style={{ padding: 20, color: 'green', textAlign: 'center' }}>已自动获取最新价格数据</div>
          ) : null}
          <div className="form-input text-error">
            * 最终所采用的价格数据，将由最新云端数据自动获取
          </div>
        </div>
      </div>
      <div className="panel-footer justify-between" style={{ padding: '10px 40px 30px' }}>
        <div className="btn" onClick={() => {
          dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { step: 1 } });
        }}>上一步</div>
        <div className={state.priceData && Object.keys(state.priceData).length ? 'btn btn-primary' : 'btn btn-disabled'}
          onClick={state.priceData && Object.keys(state.priceData).length ? handleGenUpgradePath : undefined}>
          计算冲级路线
        </div>
      </div>
    </div>
  );
};

export default Step2Panel; 