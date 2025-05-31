import react, { useEffect, useRef, useCallback } from 'react';
import './App.scss';
import ItemWithTip from './components/ItemWithTip';
import { getServerListOptions, professionListOptions, sideListOptions, professionsTypeArr, professionsDataArr, reputationMap } from './util';

import Select from './components/Select';

import Message from './components/Message';

import { useProfessionState, ACTIONS } from './hooks/useProfessionState';

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

      let _price = getReagentPrice(reagent, true, true) || 0;

      if (!_price) {
        const _it = professionsDataArr[state.userConfig.professionType].find(it => it.creates?.id === reagent.id);
          if (_it) {
            if(times > 1){
              const _need = getNeed(_it, true, true, times - 1);

              if (isMiss) {
                _price = 0;
              } else {
                _price = _need.total;
              }  
            }else{
              // console.log("过度递归");
              // console.log(item);
              // console.log(reagent);
            }
          }
      }

      total += _price * reagent.count;

      if (!_price) {
        isMiss = true;
      }
    });

    if (single) {
      total = Math.round(total / (item.creates?.count || 1));
    }

    if (pure) {

      return {
        total,
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

        total += cost;
      }

      total += resItem.cost;

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
      state.userConfig.step === 1 || !state.userConfig.step ? <div className="panel-static" style={{ marginTop: -20 }}>
        <div className="panel-title">请选择专业、服务器、阵营</div>

        <div className="panel-body">

          <div className="config-staic-form">
            <p className="form-label">专业</p>
            <Select value={state.userConfig.professionType} className="form-input select-primary" placeholder="选择专业" data={professionListOptions} onChange={
              (value) => {
                dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { professionType: value } });
              }
            }
            />

            <p className="form-label">服务器</p>

            <Select
              className="form-input select-primary"
              placeholder="选择服务器, 可使用关键字检索"
              data={getServerListOptions()}
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
              data={sideListOptions}
              value={state.userConfig.side}
              onChange={
                (value) => {
                  dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { side: value } });
                }
              } />

          </div>

        </div>

        <div className="panel-footer justify-center">
          {/* <div className="btn">上一步</div> */}
          <div className={step1Enabled() ? "btn btn-primary" : "btn btn-disabled"} onClick={
            () => {
              if (step1Enabled()) {
                dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { step: 2 } });
              }
            }
          }>下一步</div>
        </div>

      </div> : null
    }

    {
      state.userConfig.step === 2 ? (
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
      ) : null
    }

    {
      state.userConfig.step === 3 ? <div className="panel-main" >
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

        <div className="panel-body flex">
          <div className="price-table-wrap h-100 overflow-auto">
            <div className="price-table">
              <div className="table-header">
                <div className="table-col">名称</div>
                <div className="table-col">制造材料/单价</div>
                <div className="table-col">点数</div>
                <div className="table-col">生产成本/单次</div>
                <div className="table-col">售价/单价 <span className="text-success">选择出售方式</span></div>
                {/* <div className="table-col">售价/单价</div> */}
                <div className="table-col">实际成本/单次</div>
                <div className="table-col">图纸 <span className="text-success">选择获取方式</span></div>
                {/* <div className="table-col">启用</div> */}
              </div>

              {
                professionsDataArr[state.userConfig.professionType].map((item, index) => <div key={item.id} className={`table-row row-${index} ${state.pathData?.data?.find(_it => _it.id === item.id) ? ' active' : ''} ${state.highLightItem === item.id ? ' high-light' : ''}`}>

                  <div className="table-col flex items-center">
                    <div className="icon-wrap lg">
                      <img className="icon" src={`./resources/wlk/icons/medium/${item.icon}.jpg`} />
                      {
                        item.creates && item.creates.count > 1 ? <div className="tag-count">{item.creates.count}</div> : ''
                      }
                    </div>
                    <p className="item-name" style={{ whiteSpace: 'initial', color: ['#fff', '#fff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'][item.creates?.quality || 0] }}>{item.name}</p>
                  </div>
                  <div className="table-col flex flex-column justify-center">
                    {
                      item.reagents.map(reagent => <div key={reagent.id} className="item-reagent flex">

                        <ItemWithTip tip={reagent.name} color={['#fff', '#fff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'][reagent.quality || 0]}>
                          <div className="icon-wrap" style={{ marginRight: 5 }}>
                            <img className="icon" src={`./resources/wlk/icons/medium/${reagent.icon}.jpg`} />

                            {
                              reagent.sources && reagent.sources === 'merchant' ? <span className="sell-tag"></span> : ''
                            }

                            {
                              reagent.count > 1 ? <div className="tag-count">{reagent.count}</div> : ''
                            }

                          </div>
                        </ItemWithTip>

                        {
                          state.priceData ? getReagentPrice(reagent) : null
                        }

                      </div>)
                    }
                  </div>
                  <div className="table-col col-points">
                    <span className="point">{item.color_level_1 || ''}</span>
                    <span className="point">{item.color_level_2}</span>
                    <span className="point">{item.color_level_3}</span>
                    <span className="point">{item.color_level_4}</span>
                  </div>
                  <div className="table-col flex items-center">
                    {/* {
                      priceData ? <div>{item.reagents ? getNeed(item) || '' : ''}</div> : ''
                    } */}

                    {
                      state.userConfig?.itemsStatus && state.userConfig?.itemsStatus[item.name]?.pdCost && !state.userConfig.itemsStatus[item.name].pdCost.isMiss ? <>{getPrice(state.userConfig.itemsStatus[item.name].pdCost.total)}</> : null
                    }
                  </div>
                  <div className="table-col flex flex-column justify-center">
                    {/* 拍卖售价 */}
                    {
                      state.priceData && item.creates && state.priceData[item.name.indexOf('附魔') === 0 ? `卷轴：${item.name}` : item.creates.name] ? <div className={`item-price-content${state.userConfig?.itemsStatus[item.name].sellType === 'auction' ? ' active' : ''}`} onClick={handleSelectSellPrice(item.name, 'auction')} >
                        <p className="price-tag">拍卖</p>
                        {getPrice(state.priceData[item.name.indexOf('附魔') === 0 ? `卷轴：${item.name}` : item.creates.name])}
                      </div> : ''
                    }

                    {
                      item.creates?.sell_price ? <div className={`item-price-content${state.userConfig?.itemsStatus[item.name].sellType === 'merchant' ? ' active' : ''}`} onClick={handleSelectSellPrice(item.name, 'merchant')} >
                        <p className="price-tag spec">卖店</p>
                        {getPrice(item.creates.sell_price)}
                      </div> : ''
                    }
                  </div>
    
                  <div className="table-col flex items-center">
                    {/* 实际成本 */}
                    {/* {getActualCost(item)} */}

                    {
                      state.userConfig?.itemsStatus[item.name]?.sellType === 'auction' && state.userConfig.itemsStatus[item.name].acCostAuc && !state.userConfig.itemsStatus[item.name].acCostAuc.isMiss ? getPrice(state.userConfig.itemsStatus[item.name].acCostAuc.total) : null
                    }

                    {
                      state.userConfig?.itemsStatus[item.name].sellType === 'merchant' && state.userConfig.itemsStatus[item.name].acCostMer && !state.userConfig.itemsStatus[item.name].acCostMer.isMiss ? getPrice(state.userConfig.itemsStatus[item.name].acCostMer.total) : null
                    }

                  </div>

                  <div className="table-col flex flex-column justify-center">
                    {/* 图纸来源 */}

                    {
                      !item.isDisabled && !item.bluePrint ? <div className="sources-wrap" >
                        <p className={`sources-title type-1 ${state.userConfig?.itemsStatus[item.name].access == 1 ? 'active' : ''}`} onClick={() => {
                          handleAccessChange(item.name, 1, item.isDisabled)
                        }} >训练师</p>
                      </div> : null
                    }


                    {
                      item.bluePrint?.sources ? genSources(item.bluePrint.sources, item) : null
                    }

                    {
                      item.bluePrint?.name ? <div className="sources-wrap">
                        <p className={`sources-title type-4 ${state.userConfig?.itemsStatus[item.name].access == 4 ? 'active' : ''}`} onClick={() => {
                          handleAccessChange(item.name, 4, item.isDisabled)
                        }}>拍卖&nbsp;&nbsp;{state.priceData[item.bluePrint.name] ? getPrice(state.priceData[item.bluePrint.name]) : <span className="text-error">缺失</span>}</p>
                      </div> : null
                    }

                    <div className="sources-wrap" >
                      <p className={`sources-title type-2 ${state.userConfig?.itemsStatus[item.name].access == 2 ? 'active' : ''}`} onClick={() => {
                        handleAccessChange(item.name, 2, item.isDisabled)
                      }}>禁用</p>
                    </div>
                  </div>

                </div>)
              }
            </div>
          </div>

          {
            state.pathData ? <>
              <div className="path-wrap normal">
                <div className='wrap-title flex items-center'>
                  <div className='fs-16'>升级路线</div>
                  <input min="1" max="449" type="number" className="input-point" value={state.userConfig.start} onChange={(e) => {

                    dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { start: e.target.value } });


                  }} /> 至 <input min="2" max="450" type="number" className="input-point" value={state.userConfig.end} onChange={(e) => {

                    dispatch({ type: ACTIONS.UPDATE_USER_CONFIG, payload: { end: e.target.value } });

                  }} />

                </div>

                {
                  state.pathData.errorMessage ? <div className="path-error-msg">
                    {state.pathData.errorMessage}
                  </div> : <>
                    <div className="flex items-center justify-between" style={{ paddingLeft: 5, paddingRight: 5 }}>
                      <div className="subtitle">共花费 {getPrice(Math.round(state.pathData.total))}</div>
                      {
                        state.materialModalShow ? null : <div className="btn-material pointer text-success" onClick={() => {
                          dispatch({ type: ACTIONS.SET_MATERIAL_MODAL_SHOW, payload: true })
                        }}>查看材料清单&gt;&gt;</div>
                      }

                    </div>

                    <div className='path-content'>
                      <div className='path-header'>
                        <div className="path-col">名称</div>
                        <div className="path-col">技能点数</div>
                        <div className="path-col">次/制/用</div>

                        <div className="path-col">花费</div>

                      </div>
                      {
                        state.pathData.data.map((_item, index) => <div key={index} className='path-row' onClick={handlePathItemClick(_item)} onMouseEnter={handlePathItemMouseIn(_item, _item.bluePrint)} onMouseLeave={handlePathItemMouseOut()} >

                          <div className="path-col">
                            <div className="icon-wrap">
                              <img className="icon" src={`./resources/wlk/icons/medium/${_item.icon}.jpg`} />
                            </div>
                            <div className='item-name flex-grow-1' style={{ color: ['#fff', '#fff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'][_item.quality || 0] }}>{_item.name}</div>
                          </div>

                          <div className='path-col'>
                            {
                              _item.bluePrint ? <span >
                                数量 1
                              </span> : <>
                                {_item.start} ~ {_item.end}
                              </>
                            }

                          </div>


                          <div className="path-col text-success ">
                            {!_item.bluePrint ? <div>
                              <div className="col-item-count">{_item.count} 次</div>
                              <div className="col-item-create">{_item.createCount}个</div>
                              <div className={_item.useCount ? 'col-item-use' : 'dn'}><span>{_item.useCount}</span>用</div>
                            </div> : null}
                          </div>

                          <div className='path-col flex-wrap'>
                            <div>
                              {!_item.bluePrint && _item.cost ? <div>
                                <div>{getPrice(Math.round(_item.cost))}</div>
                                {_item.usedPres.map(_pre => <div key={_pre.name} className="text-error" style={{ lineHeight: 1.2 }} >
                                  + {_pre.name}*{_pre.count}
                                </div>)}
                              </div> : null}

                              {
                                _item.bluePrint ? <>
                                  {
                                    (_item.access == 3 || _item.access == 4) ? (_item.cost ? getPrice(Math.round(_item.cost)) : <span className="text-error">缺失&nbsp;</span>) : null
                                  }

                                  {
                                    (_item.access == 5) ? <span className="text-success">掉落\任务或其它&nbsp;</span> : null
                                  }

                                  {
                                    _item.access == 4 ? <span className="tag-merchant error" >拍卖</span> : null
                                  }

                                  {
                                    _item.access == 3 ? <span className="tag-merchant primary" >NPC</span> : null
                                  }

                                </> : null
                              }
                            </div>

                            {
                              _item.access == 3 && _item.requires_faction ? <div className="w-100 tag-faction" >{_item.requires_faction.name}&nbsp;&nbsp;{reputationMap[_item.requires_faction.reputation_id]}</div> : null
                            }

                          </div>

                        </div>)
                      }
                    </div>
                  </>
                }
              </div>

              {
                state.materialModalShow ? <div className="path-wrap spec">
                  <div className='wrap-title flex items-center justify-between'>
                    <div className='fs-16'>
                      材料清单&nbsp;&nbsp;
                      <span className="fs-14 text-primary pointer" onClick={handleCopyMaterialList} >[复制]</span>
                    </div>

                    <svg onClick={() => {
                      dispatch({ type: ACTIONS.SET_MATERIAL_MODAL_SHOW, payload: false })
                    }} className="pointer" viewBox="0 0 1024 1024" width="20" height="20"><path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128l-265.344 263.936-263.04-263.84C236.64 191.584 216.384 191.52 203.84 204 191.328 216.48 191.296 236.736 203.776 249.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248 6.24 6.272 14.464 9.44 22.688 9.44 8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408 8.192 0 16.352-3.136 22.592-9.344 12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z" p-id="2272" fill="#ccc"></path></svg>

                  </div>

                  {
                    state.pathData.errorMessage ? <div className="path-error-msg">
                      {state.pathData.errorMessage}
                    </div> : <>
                      <div className='path-content spec'>
                        <div className='path-header'>
                          <div className="path-col">名称</div>
                          <div className="path-col">数量</div>

                          <div className="path-col">花费</div>

                        </div>

                        {
                          state.pathData.reagents.map((_item, index) => <div key={index} className={`path-row ${_item.bluePrint ? 'blue-print' : ''}`} onClick={() => {
                            _item.bluePrint && handlePathItemClick(_item)();
                          }}>
                            <div className="path-col">
                              <div className="icon-wrap">
                                <img className="icon" src={`./resources/wlk/icons/medium/${_item.icon}.jpg`} />
                                {
                                  _item.sources && _item.sources === 'merchant' ? <span className="sell-tag"></span> : ''
                                }
                              </div>
                              <div className='item-name flex-grow-1' style={{ color: ['#fff', '#fff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'][_item.quality || 0] }}>{_item.name}</div>
                            </div>

                            <div className='path-col'>{Math.round(_item.count) - getCreateCount(_item.id, Math.round(_item.count))}</div>

                            <div className='path-col flex-wrap'>

                              <div>
                                {
                                  !_item.bluePrint ? getPrice(getReagentPrice(_item, true, true) * (Math.round(_item.count) - getCreateCount(_item.id, Math.round(_item.count)))) : null
                                }

                                {
                                  _item.bluePrint ? <>
                                    {
                                      (_item.access == 3 || _item.access == 4) ? (_item.cost ? getPrice(Math.round(_item.cost)) : <span className="text-error">缺失&nbsp;</span>) : null
                                    }

                                    {
                                      (_item.access == 5) ? <span className="text-success">掉落\任务或其它&nbsp;</span> : null
                                    }

                                    {
                                      _item.access == 4 ? <span className="tag-merchant error" >拍卖</span> : null
                                    }

                                    {
                                      _item.access == 3 ? <span className="tag-merchant primary" >NPC</span> : null
                                    }

                                  </> : null
                                }
                              </div>


                              {
                                _item.access == 3 && _item.requires_faction ? <div className="w-100 tag-faction" >{_item.requires_faction.name}&nbsp;&nbsp;{reputationMap[_item.requires_faction.reputation_id]}</div> : null
                              }
                            </div>
                          </div>)
                        }
                      </div>
                    </>
                  }
                </div>
                  : null
              }
            </> : null
          }


        </div>
      </div> : null
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
