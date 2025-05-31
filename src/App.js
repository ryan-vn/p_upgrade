import react, { useEffect, useRef, useCallback } from 'react';
import './App.scss';
import ItemWithTip from './components/ItemWithTip';
import { getServerListOptions, professionListOptions, sideListOptions, professionsTypeArr, professionsDataArr, reputationMap } from './util';

import Select from './components/Select';

import Message from './components/Message';

import { useProfessionState, ACTIONS } from './hooks/useProfessionState';
import Step1Panel from './components/Step1Panel';
import Step2Panel from './components/Step2Panel';
import Step3Panel from './components/Step3Panel';

let hasReStore = window.localStorage.getItem('hasReStore');

if (!hasReStore) {
  window.localStorage.setItem('userConfig', JSON.stringify({}));

  window.localStorage.setItem('priceData', JSON.stringify({}));

  window.localStorage.setItem('hasReStore', 'ok');
}

const App = () => {
  const [state, dispatch] = useProfessionState();
  const shoppingListEl = useRef(null);
  const materialListEl = useRef(null);

  useEffect(() => {
    if (!state.userConfig.start) {
      dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { start: '1' } });
    }
    if (!state.userConfig.end) {
      dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { end: '450' } });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('userConfig', JSON.stringify(state.userConfig || {}));
  }, [state.userConfig]);

  useEffect(() => {
    window.localStorage.setItem('priceData', JSON.stringify(state.priceData || {}));
  }, [state.priceData]);

  useEffect(() => {
    if (state.userConfig.professionType || state.userConfig.professionType === 0) {

      const _itemsStatus = {};

      professionsDataArr[state.userConfig.professionType].forEach(({ name, access }) => {
        _itemsStatus[name] = {
          access,
          sellType: 'merchant',
          pdCost: null,
          acCostAuc: null,
          acCostMer: null,
        };
      });

      dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { itemsStatus: _itemsStatus } });

    }
  }, [state.userConfig.professionType]);

  useEffect(() => {
    if (state.userConfig.step === 2) {
      dispatch({ type: ACTIONS.SET_PRICE_DATA, payload: {} });
      initShoppingStr();
    } else {
      dispatch({ type: ACTIONS.SET_LIST_STATUS, payload: 'init' });
    }
  }, [state.userConfig.step]);

  useEffect(() => {
    if (
      state.userConfig.step === 2 &&
      state.userConfig.professionType != null &&
      state.userConfig.server != null &&
      state.userConfig.side != null &&
      Object.keys(state.priceData).length === 0
    ) {
      dispatch({ type: ACTIONS.SET_LOADING_PRICE_DATA, payload: true });
      dispatch({ type: ACTIONS.SET_PRICEDATA_ERROR, payload: false });
      console.log("state.userConfig.professionType",state.userConfig.professionType )
      fetch(`https://auction-api.wekic.com/auction-history/profession-upgrade/29/1/9`, {
        headers: {
          'game-version': 'wlk',
          Accept: '*/*',
          Host: 'auction-api.wekic.com',
          Connection: 'keep-alive',
          Cookie: 'sl-session=DIv3GjQ/PGiVAWUwulxdvQ==',
        },
      })
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) {
            dispatch({ type: ACTIONS.SET_PRICE_DATA, payload: res.data });
          } else {
            dispatch({ type: ACTIONS.SET_PRICEDATA_ERROR, payload: '获取价格数据失败' });
          }
        })
        .catch(() => dispatch({ type: ACTIONS.SET_PRICEDATA_ERROR, payload: '网络错误' }))
        .finally(() => dispatch({ type: ACTIONS.SET_LOADING_PRICE_DATA, payload: false }));
    }
  }, [
    state.userConfig.step,
    state.userConfig.professionType,
    state.userConfig.server,
    state.userConfig.side,
    state.priceData
  ]);

  useEffect(() => {
    if (state.priceData && professionsDataArr[state.userConfig.professionType] && (state.userConfig.step === 3)) {

      dispatch({ type: ACTIONS.SET_LOADING_GLOBAL, payload: true });

      setTimeout(() => {
        dispatch({ type: ACTIONS.SET_PATH_DATA, payload: genUpgradePath() });
        dispatch({ type: ACTIONS.SET_LOADING_GLOBAL, payload: false });
      }, 0);

      // setPathData(genUpgradePath());
    }
  }, [state.userConfig, state.priceData]);

  useEffect(() => {
    if (state.priceData.status === 'ok') {

      let _itemsStatus = { ...state.userConfig.itemsStatus };

      professionsDataArr[state.userConfig.professionType].forEach(item => {
        // 计算 生产成本 实际成本/商店出售  实际成本/拍卖行出售
        const _pdCost = getNeed(item, true);

        const _acCostAuc = getActualCost(item, true, false, 'auction');

        const _acCostMer = getActualCost(item, true, false);

        // console.log(_proCost, _acCostAuc, _acCostMer);

        _itemsStatus[item.name] = {
          ..._itemsStatus[item.name],
          pdCost: _pdCost,
          acCostAuc: _acCostAuc,
          acCostMer: _acCostMer
        };

      });

      dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { itemsStatus: _itemsStatus } });

    }
  }, [state.priceData]);

  const updateUserConfig = (key, value) => {
    dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { [key]: value } });
  };

  const genShoppingList = () => {
    shoppingListEl.current.select();

    document.execCommand('copy');

    // alert('已将购物清单复制到剪切板');

    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: <Message key={Math.random()} type="success" duration={3000} content="已将购物清单复制到剪切板" /> });

  };

  const initShoppingStr = () => {
    const _data = professionsDataArr[state.userConfig.professionType];

    let inputOutput = [];

    _data.forEach((item, index) => {
      if (!item.isDisabled) {
        // 发现材料不在列表中，则降材料纳入列表
        if (item.reagents) {
          item.reagents.forEach(_reag => {

            if (!inputOutput.find(_inOut => _inOut.name == _reag.name)) {

              if (!(_reag.sources && _reag.sources === 'merchant')) {
                inputOutput.push(_reag);
              }

            }

          });
        }

        // 发现产物不在列表中，则降产物纳入列表
        if (item.creates?.name && (!inputOutput.find(_inOut => _inOut.name == item.creates.name))) {
          inputOutput.push(item.creates);
        }

        if (state.userConfig.professionType == 1 && item.name.indexOf('附魔') === 0) {
          inputOutput.push({ name: `卷轴：${item.name}` });
        }

        // 加入设计图
        if (item.bluePrint?.name && (!inputOutput.find(_inOut => _inOut.name == item.bluePrint.name))) {
          inputOutput.push(item.bluePrint);
        }

      }
    });

    let _priceData = {};

    let _outputStr = '';

    inputOutput.forEach(_io => {
      _priceData[_io.name] = null;

      _outputStr = _outputStr + `^"${_io.name}";;;;;;;;;;`;
    });

    dispatch({ type: ACTIONS.SET_PRICE_DATA, payload: _priceData });

    shoppingListEl.current.value = `${professionsTypeArr[state.userConfig.professionType]}1-450${_outputStr}`;
  };

  const step1Enabled = () => {
    const { professionType, server, side } = state.userConfig;

    return (professionType || professionType === 0) && (server || server === 0) && (side || side === 0);
  };

  const handleGenUpgradePath = async () => {
    if (state.stick) return;
    dispatch({ type: ACTIONS.SET_STICK, payload: true });
    dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { step: 3 } });
    dispatch({ type: ACTIONS.SET_STICK, payload: false });
  };

  // 防抖设定

  const getPrice = (price, count = 1, sell_price) => {

    price = price || 0;

    let isNagative = price < 0;

    price = Math.abs(price);

    let isSellPrice = false;

    if (!price && sell_price || (price && (sell_price > price))) {
      price = sell_price;
      isSellPrice = true;
    }

    // const tong = parseInt(`${price * count}`.slice(-2) || '0');

    // const siliver = parseInt(`${price * count}`.slice(-4, -2) || '0');

    const tong = price * count % 100;

    const siliver = Math.floor(price * count % 10000 / 100);

    const gold = Math.floor(price * count / 10000);

    // console.log(gold, siliver, tong);

    return <span style={{ fontSize: 12 }}>{gold ? <span className="coin-gold" style={{ color: '#ffc800' }}>{gold}</span> : ''}{siliver ? <span className="coin-silver" style={{ color: '#eee' }}>{siliver}</span> : ''}{tong ? <span className="coin-copper" style={{ color: '#ff8d00' }}>{tong}</span> : ''}{isSellPrice ? <span className='trade-tag'>商</span> : ''}{isNagative ? <span className='trade-tag'>赚</span> : ''}</span>

  };

  const handleAccessChange = (name, value, isDisabled) => {
    if (isDisabled) {
      return;
    }

    if (state.userConfig.itemsStatus[name]?.access != value) {
      dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { itemsStatus: { ...state.userConfig.itemsStatus, [name]: { ...state.userConfig.itemsStatus[name], access: value } } } });
    }

  };

  const genSources = (sources, item) => {
    if (sources?.length) {
      const [merchantSources, otherSources] = sources;

      return <div className="fs-12">

        {
          merchantSources ? <div className="sources-wrap">
            <div className={`sources-title type-3 ${state.userConfig?.itemsStatus[item.name].access == 3 ? 'active' : ''}`} onClick={() => {
              handleAccessChange(item.name, 3, item.isDisabled)
            }} >
              <div className="flex flex-column">
                <div>NPC 购买&nbsp;({merchantSources.length})&nbsp;&nbsp;{getPrice(item.bluePrint.buy_price)}</div>

                {
                  item.bluePrint.requires_faction ? <div className="faction">
                    {
                      item.bluePrint.requires_faction.name
                    }
                    &nbsp;&nbsp;
                    {
                      reputationMap[item.bluePrint.requires_faction.reputation_id]
                    }
                  </div> : null
                }
              </div>

            </div>

            <ul className="sources-list" style={{ color: '#1eff00' }}>
              {
                merchantSources.map(_source => <li key={_source.npcName} className="flex items-center" >
                  <div className="source-marker source-marker-sell"></div>
                  {`${_source.npcName}-${(_source.npcZones || []).join('/')}`} &nbsp;
                </li>)
              }
            </ul>

          </div> : null
        }

        {
          otherSources ? <div className="sources-wrap">
            <p className={`sources-title type-5 ${state.userConfig?.itemsStatus[item.name].access == 5 ? 'active' : ''}`} onClick={() => {
              handleAccessChange(item.name, 5, item.isDisabled)
            }} >掉落、任务或其它渠道&nbsp;({otherSources.length})&nbsp;</p>

            <div className="sources-list">

              {
                otherSources.map((_source, index) => {
                  switch (_source.type) {
                    // 区域掉落
                    case 0:
                      return <div className="flex items-center" key={index} style={{ color: '#ccc' }}>
                        <div className="source-marker source-marker-drop-many"></div>
                        {`区域掉落: ${_source.zoneName}`}
                      </div>;
                    // 世界掉落
                    case 1:
                      return <div className="flex items-center" key={index} style={{ color: '#ccc' }}>
                        <div className="source-marker source-marker-drop-many"></div>
                        {`世界掉落: 等级 ${_source.min_level}~${_source.max_level}`}
                      </div>;
                    // 指定怪物掉落
                    case 2:
                      return <div className="flex items-center" key={index} style={{ color: '#ff3333' }}>
                        <div className="source-marker source-marker-drop"></div>
                        {`${(_source.npcZones || []).join('/')}-${_source.npcName}`}
                      </div>;
                    // 任务事件
                    case 4:
                      return <div className="flex items-center" key={index} style={{ color: '#ffd100' }}>
                        <div className="source-marker source-marker-quest-end"></div>
                        {`${_source.questName}${_source.questObjectives ? `【${_source.questObjectives.join('/')}】` : ''}`}
                      </div>;
                    // 专业制造
                    case 5:
                      return <div className="flex items-center" key={index} style={{ color: '#ffd100' }}>
                        {_source.spellName ? `${_source.spellName} 制造` : ''}
                      </div>;
                    // 物品开出
                    case 7:
                      return <div className="flex items-center" key={index} style={{ color: '#fff' }}>
                        {
                          _source.itemIcon ? <div className="wow-icon wow-icon-tiny"><img src={`./resources/wlk/icons/medium/${_source.itemIcon}.jpg`} /></div> : null
                        }
                        &nbsp;

                        {`${_source.itemName}${_source.itemEventName ? `【${_source.itemEventName}】` : ''}`}
                      </div>;
                    // 地图物品触发
                    case 8:
                      return <div className="flex items-center" key={index} style={{ color: '#ffd100' }}>
                        <div className="source-marker source-marker-interact"></div>
                        {`${_source.objName}-${(_source.objLocations || []).join('/')}`}
                      </div>;
                    default:
                      console.log(_source, item);
                      return null;
                      break;
                  }
                })
              }
            </div>

          </div> : null
        }

      </div>
    } else {
      return <></>;
    }
  };

  const getNeed = (item, pure = false, single = false, times = 5) => {

    const reagents = item.reagents;

    let total = 0;

    let isMiss = false;

    reagents.forEach(reagent => {

      let _price = Number(getReagentPrice(reagent, true, true)) || 0;

      if (!_price) {
        const _it = professionsDataArr[state.userConfig.professionType].find(it => it.creates?.id === reagent.id);
          if (_it) {
            if(times > 1){
              const _need = getNeed(_it, true, true, times - 1);

              if (isMiss) {
                _price = 0;
              } else {
                _price = Number(_need.total);
              }  
            }else{
              // console.log("过度递归");
              // console.log(item);
              // console.log(reagent);
            }
          }
      }

      total += Number(_price) * Number(reagent.count);

      if (!_price) {
        isMiss = true;
      }
    });

    if (single) {
      total = Math.round(total / (Number(item.creates?.count) || 1));
    }

    if (pure) {

      return {
        total: Number(total),
        isMiss
      };
    }

    return getPrice(total);

  };

  const getActualCost = (item, pure = false, single = false, type) => {

    if (!item.reagents || !state.priceData) {
      return;
    }

    const _cost = getNeed(item, true);


    if (_cost.isMiss) {

      if (pure) {
        return {
          isMiss: true,
          total: 0,
        }
      }

      return '';
    }

    let _sellPrice = 0;

    switch (type || state.userConfig.itemsStatus[item.name].sellType) {
      case 'auction':
        _sellPrice = (state.priceData[item.name.indexOf('附魔') === 0 ? `卷轴：${item.name}` : item.creates.name] || 0) * (item.creates?.count || 1);
        break;
      case 'merchant':
        _sellPrice = (item.creates.sell_price || 0) * (item.creates.count || 1);
        break;
      // case 'custom':
      //   let _price = 0;

      //   if (customPriceData[item.name] && customPriceData[item.name].length) {
      //     const [gold, siliver, tong] = customPriceData[item.name];
      //     _price = (parseInt(gold || '0') * 10000) + (parseInt(siliver || '0') * 100) + parseInt(tong || '0');
      //   }

      //   _sellPrice = _price;

      //   break;

      default:
        _sellPrice = (item.creates.sell_price || 0) * (item.creates.count || 1);
        break;
    }

    let _price = single ? Math.round((_cost.total - _sellPrice) / (item.creates.count || 1)) : _cost.total - _sellPrice;

    if (pure) {

      return {
        isMiss: false,
        total: _price,
      }
    }

    return getPrice(_price);

  };

  const isWithBlueEnable = (_it, bluePrintPrice) => {
    const { color_level_1, color_level_2, color_level_3, color_level_4 } = _it;

    let _start = color_level_1 || color_level_2 || color_level_3;

    let _end = color_level_4 || color_level_3;

    let costWithItem = 0;
    let costWithOutItem = 0;

    // 考虑必经过路线的影响

    let isOnly = false;

    if (_end > _start) {
      for (let i = _start; i < _end; i++) {

        let targetWithItem = null;
        let targetWithOutItem = null;

        professionsDataArr[state.userConfig.professionType].forEach(item => {

          const { color_level_1, color_level_2, color_level_3, color_level_4 } = item;

          let low = color_level_1 || color_level_2 || color_level_3;

          let high = color_level_4 || color_level_3;

          if (i >= low && i < high) {
            let ratio = 1;

            ratio = ((color_level_4 - color_level_2) / (color_level_4 - i)).toFixed(2);

            if (ratio < 1) {
              ratio = 1;
            }

            const _needRes = (state.userConfig.itemsStatus[item.name].sellType === 'auction' ? state.userConfig.itemsStatus[item.name].acCostAuc : state.userConfig.itemsStatus[item.name].acCostMer);

            if (!_needRes) {
              return false;
            }

            if (!_needRes.isMiss) {
              const _price = _needRes.total * ratio;

              if (targetWithItem) {

                if (_price < targetWithItem.price) {
                  targetWithItem = {
                    ...item,
                    price: _price,
                    point: i,
                  };
                }
              } else {

                // 根据品质计算涨一点需要的价格
                targetWithItem = {
                  ...item,
                  price: _price,
                  point: i,
                };
              }

              if (_it.name !== item.name) {
                if (targetWithOutItem) {
                  if (_price < targetWithOutItem.price) {
                    targetWithOutItem = {
                      ...item,
                      price: _price,
                      point: i,
                    };
                  }
                } else {
                  targetWithOutItem = {
                    ...item,
                    price: _price,
                    point: i,
                  };
                }
              }
            }
          }
        });

        if (targetWithItem) {
          // arrWithItem.push(targetWithItem);
          costWithItem += targetWithItem.price;
        }

        if (targetWithOutItem) {
          // arrWithOutItem.push(targetWithOutItem);
          costWithOutItem += targetWithOutItem.price;
        }

        if (targetWithItem && !targetWithOutItem) {
          isOnly = true;
        }
      }

      if (isOnly || (costWithItem + bluePrintPrice < costWithOutItem)) {
        return true;
      }

    }

    return false;

    // 根据 item 的成本，item 的范围，计算在此范围内的路线物品，然后对比加上蓝图的成本和排除在外的成本

  };

  const genUpgradePath = () => {
    const _start = parseInt(state.userConfig.start);
    const _end = parseInt(state.userConfig.end);

    if (isNaN(_start) || isNaN(_end)) {
      return {
        errorMessage: '起始或终止参数格式不正确',
      };
    }

    if (_start < 1) {
      return {
        errorMessage: '起始点数不能小于1',
      };
    } else if (_end > 450) {
      return {
        errorMessage: '终止点数不能大于450',
      };
    } else if (_start >= _end) {
      return {
        errorMessage: '终止点数应大于起始点数',
      };
    }

    // 橙色（红色），做一次必涨1点专业技能；有些后面还有个箭头加一个数字的，表示做一个能涨该数字的技能点数。
    // 黄色：做一次有80%的概率涨一点专业技能
    // 绿色：做一次有40%的概率涨一点

    let itemArr = [];

    let reagents = [];

    let excludeItems = {};

    // 计算每一个点位的制作选择
    for (let i = _start; i < _end; i++) {
      // 寻找该点所有可制造的物品

      let targetItem = null;

      professionsDataArr[state.userConfig.professionType].forEach(item => {

        // access 逻辑
        // 根据 access 类型计算 cost
        if (state.userConfig?.itemsStatus[item.name]?.access != 2 && !excludeItems[item.name]) {

          // 忽略可任务获取或者从商人处购买的低于10J的配方（计算快）

          let _access;

          if (state.userConfig.itemsStatus[item.name].access && !item.notPassed) {
            _access = parseInt(state.userConfig?.itemsStatus[item.name]?.access);

            switch (_access) {
              case 1:
                break;
              case 3:
                // npc超过 10J 的图纸才会做排除路线计算
                if (item.bluePrint?.buy_price > 100000) {
                  if (!isWithBlueEnable(item, item.bluePrint?.buy_price)) {
                    excludeItems[item.name] = true;
                  }
                }
                break;
              case 4:
                if (state.priceData[item.bluePrint.name]) {
                  if (!isWithBlueEnable(item, state.priceData[item.bluePrint.name])) {
                    excludeItems[item.name] = true;
                  }
                }
                break;
              case 5:
                break;
              default:
                break;
            }
          }

          if (!excludeItems[item.name]) {
            const { color_level_1, color_level_2, color_level_3, color_level_4 } = item;

            let low = color_level_1 || color_level_2 || color_level_3;

            let high = color_level_4 || color_level_3;

            if (i >= low && i < high) {

              // 橙色区间 ratio 1  黄色区间 ratio 1.25   绿色区间 2.5

              let ratio = 1;

              ratio = ((color_level_4 - color_level_2) / (color_level_4 - i)).toFixed(2);

              if (ratio < 1) {
                ratio = 1;
              }

              const _needRes = (state.userConfig.itemsStatus[item.name].sellType === 'auction' ? state.userConfig.itemsStatus[item.name].acCostAuc : state.userConfig.itemsStatus[item.name].acCostMer);

              if(!_needRes){
                console.log("获取needRes失败");
                console.log(item);
                return;
              }

              // 判断是否为必走路线物品(如附魔棒子)  notPassed true passCount
              if (item.notPassed && (low + (item.passCount || 1) > i)) {
                const _price = _needRes.total * ratio;

                targetItem = {
                  ...item,
                  price: _price,
                  point: i,
                  ratio,
                  ensure: true,
                };

              } else {
                if (!_needRes.isMiss) {
                  const _price = _needRes.total * ratio;

                  if (targetItem) {

                    if (_price < targetItem.price && !targetItem.ensure) {
                      targetItem = {
                        ...item,
                        price: _price,
                        point: i,
                        ratio,
                      };
                    }
                  } else {

                    // 根据品质计算涨一点需要的价格
                    targetItem = {
                      ...item,
                      price: _price,
                      point: i,
                      ratio,
                    };
                  }

                }
              }
            }

          }

        }

      });

      if (targetItem) {
        itemArr.push(targetItem);

      }

    }

    let lastRes = [];

    let total = 0;

    let bluePrints = {};

    let bluePrintArr = [];

    for (let i = 0; i < itemArr.length; i++) {

      let _count = 0;

      let _name = itemArr[i].name;

      // 跳到后面 n 位
      let j = 0;

      let cost = 0;

      do {
        cost += (itemArr[i + j] || { price: 0 }).price;

        _count = _count + parseFloat((itemArr[i + j] || { ratio: 0 }).ratio);

        j++;

      } while ((i + j < itemArr.length) && itemArr[i + j].name == _name);

      _count = Math.round(_count);

      const { color_level_1, color_level_2, color_level_3, color_level_4, reagents, preProducedMaterial } = itemArr[i];

      let resItem = null;

      if (itemArr[i + j]) {

        resItem = {
          icon: itemArr[i].icon,
          id: itemArr[i].id,
          name: itemArr[i].name,
          creates: itemArr[i].creates,
          color_level_1,
          color_level_2,
          color_level_3,
          color_level_4,
          start: itemArr[i].point,
          end: itemArr[i + j].point,
          cost,
          quality: itemArr[i].creates?.quality || 0,
          count: _count,
          reagents,
          useCount: 0,
          usedPres: [],
          createCount: (itemArr[i].creates?.count || 1) * (_count || 0),
        };

      } else {
        resItem = {
          icon: itemArr[i].icon,
          id: itemArr[i].id,
          name: itemArr[i].name,
          creates: itemArr[i].creates,
          color_level_1,
          color_level_2,
          color_level_3,
          color_level_4,
          start: itemArr[i].point,
          end: itemArr[itemArr.length - 1].point + 1,
          cost,
          quality: itemArr[i].creates?.quality || 0,
          count: _count,
          reagents,
          useCount: 0,
          usedPres: [],
          createCount: (itemArr[i].creates?.count || 1) * (_count || 0),
        };

      }

      // 统计时，若当前项采用前面路线的某一物品作为材料，且该物品的价格计算方式为非拍卖形式（未卖出），则将该物品部分成本减去，且在该项目中表示该物品及使用数量
      // 为优化计算过程，若不采用本专业物品作为材料，则不进行遍历
      if (preProducedMaterial) {
        preProducedMaterial.forEach(_pre => {

          let _targetPre = lastRes.find(it => it.id === _pre.id);

          let _createCount = 0;

          // 非拍卖模式 & 如果数量足够则能用尽用 计算总使用量
          // 判断所使用的材料共提供制作了多少份当前产物的量

          // 计算所节省的成本

          if (_targetPre && (state.userConfig.itemsStatus[_targetPre.name].sellType == 'merchant')) {

            if (_targetPre.useCount < _targetPre.createCount) {
              let _noUseCount = _targetPre.createCount - _targetPre.useCount;

              if (_noUseCount > _count * _pre.count) {
                _createCount = _count;
              } else {
                _createCount = Math.floor(_noUseCount / _pre.count);
              }

              _targetPre.useCount = _targetPre.useCount + (_createCount * _pre.count);

              if (_createCount) {
                let _c = _createCount * _pre.count;

                resItem.usedPres = [...resItem.usedPres, {
                  icon: _targetPre.icon,
                  name: _targetPre.name,
                  count: _createCount * _pre.count,
                }];

                resItem.cost = resItem.cost - (_c * getNeed(_targetPre, true, true).total);
              }
            }

          }

        });

      }


      lastRes.push(resItem);

      // 如果有蓝图，则加入蓝图
      if (!bluePrints[itemArr[i].name] && itemArr[i].bluePrint) {
        let cost = 0;

        let _access = state.userConfig?.itemsStatus[itemArr[i].name]?.access;

        if (_access == 3) {
          cost = itemArr[i].bluePrint.buy_price || 0;
        }

        if (_access == 4) {
          cost = state.priceData[itemArr[i].bluePrint.name] || 0;
        }

        bluePrints[itemArr[i].name] = {
          price: cost
        };

        bluePrintArr.push({
          icon: itemArr[i].bluePrint.icon || 'inv_scroll_04',
          name: itemArr[i].bluePrint.name,
          id: itemArr[i].id,
          count: 1,
          bluePrint: true,
          requires_faction: itemArr[i].bluePrint.requires_faction,
          cost,
          access: _access,
          quality: itemArr[i].creates?.quality || 0
        });

        total += Math.ceil(cost);
      }

      total += Math.ceil(resItem.cost);

      i = i + j - 1;

    }

    // reagents = reagents.sort((a, b) => a.item_level - b.item_level);

    lastRes.forEach(it => {
      if (it.reagents) {
        it.reagents.forEach(_reagent => {
          const _index = reagents.findIndex(it => it.id === _reagent.id);

          if (_index > -1) {
            reagents[_index].count += _reagent.count * it.count
          } else {

            if (reagents.length) {
              let i = 0;
              // 排序
              do {
                i++;
              } while (i < reagents.length - 1 && reagents[i].item_level < _reagent.item_level);

              reagents.splice(i + 1, 0, { ..._reagent, count: _reagent.count * it.count })
            } else {
              reagents.push({ ..._reagent, count: _reagent.count * it.count });
            }

          }
        });
      }
    });

    lastRes = [...bluePrintArr, ...lastRes];

    reagents = [...bluePrintArr, ...reagents];

    return {
      data: lastRes,
      reagents,
      total,
    }

  };

  const handleCopyMaterialList = () => {

    if (state.pathData?.reagents) {
      const outputStr = `${professionsTypeArr[state.userConfig.professionType]}${state.userConfig.start}-${state.userConfig.end}所需材料${state.pathData.reagents.map(_it => `^"${_it.name}";;;;;;;;;;`).join('')}`;

      materialListEl.current.value = outputStr;

      materialListEl.current.select();

      document.execCommand('copy');

      // alert('已将冲级材料购物清单复制到剪切板');

      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: <Message key={Math.random()} type="success" duration={3000} content="已将冲级材料购物清单复制到剪切板" /> });

    }

  };

  const handleSelectSellPrice = (name, sellType) => () => {

    if (sellType !== state.userConfig.itemsStatus[name].sellType) {
      dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { itemsStatus: { ...state.userConfig.itemsStatus, [name]: { ...state.userConfig.itemsStatus[name], sellType } } } });
    }

  };

  const handleConfigReset = () => {
    dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { start: 1, end: 450, itemsStatus: {} } });

    dispatch({ type: ACTIONS.SET_PRICE_DATA, payload: {} });

    window.localStorage.setItem('userConfig', JSON.stringify({}));

    window.localStorage.setItem('priceData', JSON.stringify({}));

    window.location.reload();
  };

  const getReagentPrice = (reagent, pure, safe) => {

    if (reagent.sources && reagent.sources === 'merchant') {
      if (pure) {
        return reagent.buy_price || 0;
      }

      return <div>{getPrice(reagent.buy_price)}</div>;
    } else {
      if (state.priceData[reagent.name]) {
        if (pure) {
          return state.priceData[reagent.name] || 0;
        }

        return <div>{getPrice(state.priceData[reagent.name])}</div>;
      } else {
        if (safe) {
          return pure ? 0 : null;
        } else {
          const _item = professionsDataArr[state.userConfig.professionType].find(_it => _it.name === reagent.name);

          if (pure) {
            return _item ? (getNeed(_item, pure, true).total || 0) : 0;
          }

          return _item ? <div>{getNeed(_item, false, true)}</div> : '';
        }

      }
    }
  };

  const handlePathItemClick = (item) => () => {
    const data = professionsDataArr[state.userConfig.professionType];

    const _index = data.findIndex(it => it.id === item.id);

    if (_index > -1) {
      const row = document.querySelector(`.row-${_index}`);

      dispatch({ type: ACTIONS.SET_HIGHLIGHT_ITEM, payload: item.id });

      row.scrollIntoView({
        block: "center",
        inline: "center"
      });
    }

  }

  const handlePathItemMouseIn = (item, isBluePrint) => () => {

    if (isBluePrint) {
      dispatch({ type: ACTIONS.SET_HOVER_ITEM, payload: null });

      return;
    }

    const { color_level_1, color_level_2, color_level_3, color_level_4, start, end } = item;

    let percentArr = [];

    let stage = 2;

    if (color_level_4 && color_level_2) {

      for (let i = start; i < end; i++) {
        let percent = 1;

        percent = (color_level_4 - i) / (color_level_4 - color_level_2);

        if (percent > 1) {
          percent = 1;
        }

        if (i < color_level_2) {
          stage = 1;
        } else if (color_level_3 && i < color_level_3) {
          stage = 2;
        } else if (i < color_level_4) {
          stage = 3;
        } else if (i === color_level_4) {
          stage = 4;
        }

        stage !== 1 && percentArr.push({
          point: i,
          percent: Math.ceil(100 * percent),
          stage,
        });
      }
    }

    dispatch({ type: ACTIONS.SET_HOVER_ITEM, payload: { ...item, percentArr } });

  };

  const handlePathItemMouseOut = () => () => {
    dispatch({ type: ACTIONS.SET_HOVER_ITEM, payload: null });
  };

  const getCreateCount = (createId, max) => {
    const _item = state.pathData?.data?.find(it => it.creates?.id === createId);

    if (_item) {
      const _count = Math.round(_item.count) * _item.creates.count;

      return _count > max ? max : _count;
    } else {
      return 0;
    }
  };

  return <main className="app-main">

    {
      state.userConfig.step === 1 || !state.userConfig.step ? <Step1Panel state={state} dispatch={dispatch} ACTIONS={ACTIONS} /> : null
    }

    {
      state.userConfig.step === 2 ? <Step2Panel state={state} dispatch={dispatch} ACTIONS={ACTIONS} handleGenUpgradePath={handleGenUpgradePath} /> : null
    }

    {
      state.userConfig.step === 3 ? <Step3Panel state={state} dispatch={dispatch} ACTIONS={ACTIONS} handleConfigReset={handleConfigReset} handleGenUpgradePath={handleGenUpgradePath} getPrice={getPrice} getReagentPrice={getReagentPrice} handleSelectSellPrice={handleSelectSellPrice} handleAccessChange={handleAccessChange} genSources={genSources} getNeed={getNeed} getActualCost={getActualCost} getServerListOptions={getServerListOptions} sideListOptions={sideListOptions} professionListOptions={professionListOptions} professionsDataArr={professionsDataArr} reputationMap={reputationMap} handlePathItemClick={handlePathItemClick} handlePathItemMouseIn={handlePathItemMouseIn} handlePathItemMouseOut={handlePathItemMouseOut} getCreateCount={getCreateCount} handleCopyMaterialList={handleCopyMaterialList} /> : null
    }

    <div className={`probability-panel ${state.materialModalShow ? 'spec' : ''} ${state.hoverItem ? '' : ' dn'}`} >
      <div className="probability-title flex justify-between" style={{ color: ['#fff', '#fff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'][state.hoverItem?.quality || 0] }}>
        {state.hoverItem?.name}
      </div>
      <div className="probability-points">
        <span>
          {state.hoverItem?.color_level_1 || (state.hoverItem?.color_level_1 === 0) ? <>{state.hoverItem?.color_level_1}&nbsp;&nbsp;</> : null}
        </span>
        <span>
          {state.hoverItem?.color_level_2 || (state.hoverItem?.color_level_2 === 0) ? <>{state.hoverItem?.color_level_2}&nbsp;&nbsp;</> : null}
        </span>
        <span>
          {state.hoverItem?.color_level_3 || (state.hoverItem?.color_level_3 === 0) ? <>{state.hoverItem?.color_level_3}&nbsp;&nbsp;</> : null}
        </span>
        <span>
          {state.hoverItem?.color_level_4}
        </span>
      </div>
      <div>
        <div>等级  涨点概率  预估次数</div>
        <ul className={`probability-list ${state.hoverItem?.percentArr.length < 19 ? 'spec' : ''}`} style={{ gridTemplateRows: `repeat(${Math.round(state.hoverItem?.percentArr.length / 2)}, 1fr)` }}>
          {
            state.hoverItem?.start < state.hoverItem?.color_level_2 ? <li className="list-item stage-1">
              <span className="point">{state.hoverItem?.start} ~ {Math.min(state.hoverItem?.end, state.hoverItem?.color_level_2) - 1}</span>
              100%
              <span className="count">1次</span>
            </li> : null
          }
          {
            state.hoverItem?.percentArr.map(_it => <li className={`list-item stage-${_it.stage}`} key={_it.point} >
              <span className="point">{_it.point}</span>
              {_it.percent}%
              <span className="count">{Math.round(100 / _it.percent)}次</span>
            </li>)
          }
        </ul>
      </div>
    </div>

    <div className={`loading-global-wrap ${state.loadingGlobal ? '' : 'dn'}`} >
      <div className="inner flex items-center justify-center">
        <div className="icon-loading" />
        <div>正在计算最佳路线</div>
      </div>
    </div>

    <textarea className="copy-input" height={0} ref={shoppingListEl}></textarea>

    <textarea className="copy-input" height={0} ref={materialListEl}></textarea>

    {state.messages}

  </main>
}

export default App;
