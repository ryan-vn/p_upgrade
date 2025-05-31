import react, { useEffect, useState, useRef } from 'react';
import './App.scss';
import ItemWithTip from './components/ItemWithTip';
import engineeringData from './api/engineering.json';
import enchantingData from './api/enchanting.json';
import alchemyData from './api/alchemy.json';
import tailoringData from './api/tailoring.json';
import leatherworkingData from './api/leatherworking.json';
import blacksmithingData from './api/blacksmithing.json';
import jewelcraftingData from './api/jewelcrafting.json';
import inscriptionData from './api/inscription.json';
import cookingData from './api/cooking.json';

import { getTimeDesc, isMy, randomString, getUserId, serverList, getServerListOptions, professionListOptions, sideListOptions } from './util';

import { genFileName, uploadFile, getTargetProfessionData, getFileList } from './util/uploadOss';

import Select from './components/Select';

import Message from './components/Message';

import ConfigPanel from './components/ConfigPanel';

import PriceDataPanel from './components/PriceDataPanel';

// import ImgLianMeng from './asserts/img/lianmeng.png';

// import ImgBuLuo from './asserts/img/buluo.png';

// import ImgServer from './asserts/img/server.png';

// import itemsData from './data/items.json';
// import staticData from './data/static.json';


// "1": cooking,
// "2": alchemy,
// "3": blacksmithing,
// "4": engineering,
// "5": inscription,
// "6": jewel,
// "7": tailoring,
// "8": leatherworking,
// "9": enchanting,
const professionsTypeArr = [
  "烹饪",
  "炼金术",
  "锻造",
  "工程学",
  "铭文",
  "珠宝加工",
  "制皮",
  "裁缝",
  '附魔',
];
const professionsDataArr = [
  cookingData,
  alchemyData,
  blacksmithingData,
  engineeringData,
  inscriptionData,
  jewelcraftingData,
  tailoringData,
  leatherworkingData,
  enchantingData,
];


const reputationMap = {
  3: '中立',
  4: '友善',
  5: '尊敬',
  6: '崇敬',
  7: '崇拜',
};

let hasReStore = window.localStorage.getItem('hasReStore');

if (!hasReStore) {
  window.localStorage.setItem('userConfig', JSON.stringify({}));

  window.localStorage.setItem('priceData', JSON.stringify({}));

  window.localStorage.setItem('hasReStore', 'ok');
}

const App = () => {

  // 是否自导入价格数据
  const [priceManual, setPriceManual] = useState(false);

  // 价格数据表
  const [priceDataList, setPriceDataList] = useState([]);

  // 用户设置
  const [userConfig, setUserConfig] = useState(JSON.parse(window.localStorage.getItem('userConfig') || '{}'));

  // 价格数据表加载状态
  const [listStatus, setListStatus] = useState('init');

  const shoppingListEl = useRef(null);

  const materialListEl = useRef(null);

  const [importModalShow, setImportModalShow] = useState(false);

  const [importDataStr, setImportDataStr] = useState('');

  const [messages, setMessages] = useState([]);

  // 防抖
  const [stick, setStick] = useState(false);

  const [priceData, setPriceData] = useState(JSON.parse(window.localStorage.getItem('priceData') || '{}'));

  const [materialModalShow, setMaterialModalShow] = useState(false);

  // 简化计算
  const [pathData, setPathData] = useState();

  const [processIndex, setProcessIndex] = useState(1);

  const [processStop, setProcessStop] = useState(false);

  const [hoverItem, setHoverItem] = useState(null);

  const [highLightItem, setHighLightItem] = useState(null);

  const [loadingGlobal, setLoadingGlobal] = useState(false);

  useEffect(() => {

    if (!userConfig.start) {
      updateUserConfig('start', '1');
    }

    if (!userConfig.end) {
      updateUserConfig('end', '450');
    }

  }, []);

  // 本地缓存用户配置
  useEffect(() => {
    window.localStorage.setItem('userConfig', JSON.stringify(userConfig || {}));
  }, [userConfig]);

  useEffect(() => {
    window.localStorage.setItem('priceData', JSON.stringify(priceData || {}));
  }, [priceData]);

  useEffect(() => {
    if (userConfig.professionType || userConfig.professionType === 0) {

      const _itemsStatus = {};

      professionsDataArr[userConfig.professionType].forEach(({ name, access }) => {
        _itemsStatus[name] = {
          access,
          sellType: 'merchant',
          pdCost: null,
          acCostAuc: null,
          acCostMer: null,
        };
      });

      updateUserConfig('itemsStatus', _itemsStatus);

    }
  }, [userConfig.professionType]);

  useEffect(() => {

    if (userConfig.step === 2) {
      loadPriceDataList();
      initShoppingStr();

    } else {
      setListStatus('init');
    }
  }, [userConfig.step]);

  useEffect(() => {
    let interval = null;

    if (userConfig.step === 2 && priceManual) {

      if (processStop) {
        clearInterval(interval);
      } else {
        interval = setInterval(() => {
          setProcessIndex(prev => prev === 11 ? 1 : (prev + 1));
        }, 4000);
      }

    } else {
      clearInterval(interval);

      setProcessIndex(1);

      setProcessStop(false);
    }

    return () => {
      clearInterval(interval);
    }

  }, [userConfig.step, priceManual, processStop]);

  useEffect(() => {
    if (priceData && professionsDataArr[userConfig.professionType] && (userConfig.step === 3)) {

      setLoadingGlobal(true);

      setTimeout(() => {
        setPathData(genUpgradePath());
        setLoadingGlobal(false);
      }, 0);

      // setPathData(genUpgradePath());
    }
  }, [userConfig, priceData]);

  useEffect(() => {
    if (priceData.status === 'ok') {

      let _itemsStatus = {...userConfig.itemsStatus};

      professionsDataArr[userConfig.professionType].forEach(item => {
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

      updateUserConfig('itemsStatus', _itemsStatus);

    }
  }, [priceData]);

  const updateUserConfig = (key, value) => {
    setUserConfig(_prevConfig => ({
      ..._prevConfig,
      [key]: value
    }));
  };

  const loadPriceDataList = () => {
    const { server, side, professionType } = userConfig;

    setListStatus('loading');

    getTargetProfessionData({
      server,
      side,
      professionType,
    }).then(res => {
      let _arr = res.objects || [];

      let _targetArr = [];

      for (let i = 0; i < _arr.length; i++) {
        let [_prefix, _type, _side, _server, _start, _end, _userId, _timeWithSuffix, _lengthWithSuffix] = _arr[i].name.split('-');

        const _time = parseInt(_timeWithSuffix.split('.')[0]);

        const _length = parseInt((_lengthWithSuffix || '').split('.')[0]);

        const _current = new Date().getTime();

        // 只显示两个月内
        // 只显示响应的点数范围内的
        // 最多选5条

        if ((_current - _time < 5184000000)) {
          _targetArr.push({
            userId: _userId,
            time: _time,
            server: parseInt(_server),
            side: parseInt(_side),
            start: _start,
            end: _end,
            profession: parseInt(_type),
            status: 'init',
            length: _length,
            url: _arr[i].url,
            isChecked: false,
          });
        }

      }

      const _resArr = _targetArr.sort((a, b) => b.time - a.time).slice(0, 5);

      _resArr[0] && (_resArr[0].isChecked = true);

      _resArr[1] && (_resArr[1].isChecked = true);

      _resArr[2] && (_resArr[2].isChecked = true);

      setPriceDataList(_resArr);

      setListStatus('ok');

      // if (!_resArr.length) {
      //   setPriceManual(true);
      // }

    }).catch(e => {
      console.log(e);
      setListStatus('error');
    });
  };

  const genShoppingList = () => {
    shoppingListEl.current.select();

    document.execCommand('copy');

    // alert('已将购物清单复制到剪切板');

    setMessages(_prev => ([..._prev, <Message key={Math.random()} type="success" duration={3000} content="已将购物清单复制到剪切板" />]));

  };

  const initShoppingStr = () => {
    const _data = professionsDataArr[userConfig.professionType];

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

        if (userConfig.professionType == 1 && item.name.indexOf('附魔') === 0) {
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

    setPriceData(_priceData);

    shoppingListEl.current.value = `${professionsTypeArr[userConfig.professionType]}1-450${_outputStr}`;
  };

  const step1Enabled = () => {
    const { professionType, server, side } = userConfig;

    return (professionType || professionType === 0) && (server || server === 0) && (side || side === 0);
  };

  const handleImportPriceData = () => {

    if (!(importDataStr || '').trim()) {
      // alert('价格数据不能为空！');

      setMessages(_prev => ([..._prev, <Message key={Math.random()} type="error" duration={3000} content="价格数据不能为空！" />]));

      return;
    }

    if (importDataStr.indexOf(';;;;;;;;;') > -1) {
      // alert('导出数据时请点击插件右下角"导出结果"按钮，而非右上角"导出"按钮！');

      setMessages(_prev => ([..._prev, <Message key={Math.random()} type="error" duration={5000} content='导出数据时请点击插件右下角"导出结果"按钮，而非右上角"导出"按钮！' />]));


      return;
    }

    const _arr = importDataStr.split('\n');

    if (_arr.length) {
      if (_arr[0].indexOf('名称') > -1 || _arr[0].indexOf('名稱') > -1) {
        _arr.shift();
      }
    } else {
      // alert('请检查数据格式是否符合要求！');

      setMessages(_prev => ([..._prev, <Message key={Math.random()} type="error" duration={3000} content="请检查数据格式是否符合要求！" />]));


      return;
    }

    // 判断结构是否正确  priceData

    const _current = new Date().getTime();

    const { professionType, server, side } = userConfig;

    let _priceData = {
      userId: getUserId(),
      time: _current,
      server,
      side,
      start: 1,
      end: 450,
      profession: professionType,
      status: 'ok',
      length: _arr.length,
      isChecked: true,
    };

    for (let i = 0; i < _arr.length; i++) {

      const _item = _arr[i];

      const [price, name] = _item.split(',');

      if (name && (parseInt(price) || price === '0')) {
        // _priceData[name.replace('卷轴：', '')] = parseInt(price);
        // .replace(/(\s+\(\d+\)|")/g, '')
        // _priceData[name.replace(/"/g, '')] = parseInt(price);
        _priceData[name.replace(/(\s+\(\d+\)|")/g, '')] = parseInt(price);
      } else {
        // alert('数据解析失败，请检查数据格式是否符合要求！');

        setMessages(_prev => ([..._prev, <Message key={Math.random()} type="error" duration={3000} content="数据解析失败，请检查数据格式是否符合要求！" />]));

        return;
      }

    }

    setPriceManual(false);

    setImportModalShow(false);

    setImportDataStr('');

    setPriceDataList(prev => {
      const arr = [_priceData, ...prev];

      return arr;
    });

    console.log('上传价格数据');

    uploadFile(genFileName({
      server,
      side,
      professionType,
      time: _current,
      start: 1,
      end: 450,
      userId: getUserId(),
      length: _arr.length,
    }), JSON.stringify(_priceData));
  };

  const handleGenUpgradePath = async () => {
    if (stick) return;
    setStick(true);
  
    // 新API地址拼接
    const { professionType, server, side } = userConfig;
    const url = `http://localhost:7890/auction-history/profession-upgrade/${server}/${side+1}/${professionType}`;
  
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API请求失败');
      const data = await res.json();
  
      setPriceData({ ...(Object.assign(priceData, data)), status: 'ok' });
      updateUserConfig('step', 3);
    } catch (e) {
      setMessages(_prev => ([..._prev, <Message key={Math.random()} type="error" duration={4000} content="价格详细信息加载失败！请重试" />]));
    }
  
    setStick(false);
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

    if (userConfig.itemsStatus[name]?.access != value) {
      setUserConfig(_prevConfig => {
        const _itemsStatus = { ..._prevConfig.itemsStatus };

        _itemsStatus[name] = {
          ..._itemsStatus[name],
          access: value
        }

        return {
          ..._prevConfig,
          itemsStatus: _itemsStatus
        }
      });
    }

  };

  const genSources = (sources, item) => {
    if (sources?.length) {
      const [merchantSources, otherSources] = sources;

      return <div className="fs-12">

        {
          merchantSources ? <div className="sources-wrap">
            <div className={`sources-title type-3 ${userConfig?.itemsStatus[item.name].access == 3 ? 'active' : ''}`} onClick={() => {
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
            <p className={`sources-title type-5 ${userConfig?.itemsStatus[item.name].access == 5 ? 'active' : ''}`} onClick={() => {
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
        const _it = professionsDataArr[userConfig.professionType].find(it => it.creates?.id === reagent.id);
          if (_it) {
            if(times > 1){
              const _need = getNeed(_it, true, true, times - 1);

              if (isMiss) {
                _price = 0;
              } else {
                _price = _need.total;
              }  
            }else{
              console.log("过度递归");
              console.log(item);
              console.log(reagent);
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

    if (!item.reagents || !priceData) {
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

    switch (type || userConfig.itemsStatus[item.name].sellType) {
      case 'auction':
        _sellPrice = (priceData[item.name.indexOf('附魔') === 0 ? `卷轴：${item.name}` : item.creates.name] || 0) * (item.creates?.count || 1);
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

        professionsDataArr[userConfig.professionType].forEach(item => {

          const { color_level_1, color_level_2, color_level_3, color_level_4 } = item;

          let low = color_level_1 || color_level_2 || color_level_3;

          let high = color_level_4 || color_level_3;

          if (i >= low && i < high) {
            let ratio = 1;

            ratio = ((color_level_4 - color_level_2) / (color_level_4 - i)).toFixed(2);

            if (ratio < 1) {
              ratio = 1;
            }

            const _needRes = (userConfig.itemsStatus[item.name].sellType === 'auction' ? userConfig.itemsStatus[item.name].acCostAuc : userConfig.itemsStatus[item.name].acCostMer);

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
    const _start = parseInt(userConfig.start);
    const _end = parseInt(userConfig.end);

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

      professionsDataArr[userConfig.professionType].forEach(item => {

        // access 逻辑
        // 根据 access 类型计算 cost
        if (userConfig?.itemsStatus[item.name]?.access != 2 && !excludeItems[item.name]) {

          // 忽略可任务获取或者从商人处购买的低于10J的配方（计算快）

          let _access;

          if (userConfig.itemsStatus[item.name].access && !item.notPassed) {
            _access = parseInt(userConfig?.itemsStatus[item.name]?.access);

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
                if (priceData[item.bluePrint.name]) {
                  if (!isWithBlueEnable(item, priceData[item.bluePrint.name])) {
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

              const _needRes = (userConfig.itemsStatus[item.name].sellType === 'auction' ? userConfig.itemsStatus[item.name].acCostAuc : userConfig.itemsStatus[item.name].acCostMer);

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

          if (_targetPre && (userConfig.itemsStatus[_targetPre.name].sellType == 'merchant')) {

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

        let _access = userConfig?.itemsStatus[itemArr[i].name]?.access;

        if (_access == 3) {
          cost = itemArr[i].bluePrint.buy_price || 0;
        }

        if (_access == 4) {
          cost = priceData[itemArr[i].bluePrint.name] || 0;
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

    if (pathData?.reagents) {
      const outputStr = `${professionsTypeArr[userConfig.professionType]}${userConfig.start}-${userConfig.end}所需材料${pathData.reagents.map(_it => `^"${_it.name}";;;;;;;;;;`).join('')}`;

      materialListEl.current.value = outputStr;

      materialListEl.current.select();

      document.execCommand('copy');

      // alert('已将冲级材料购物清单复制到剪切板');

      setMessages(_prev => ([..._prev, <Message key={Math.random()} type="success" duration={3000} content="已将冲级材料购物清单复制到剪切板" />]));

    }

  };

  const handleSelectSellPrice = (name, sellType) => () => {

    if (sellType !== userConfig.itemsStatus[name].sellType) {
      setUserConfig(_prevConfig => {
        const _itemsStatus = { ..._prevConfig.itemsStatus };

        _itemsStatus[name] = {
          ..._itemsStatus[name],
          sellType
        }

        return {
          ..._prevConfig,
          itemsStatus: _itemsStatus
        }
      });
    }

  };

  const handleConfigReset = () => {
    setUserConfig({
      start: 1,
      end: 450
    });

    setPriceData({});

    window.localStorage.setItem('userConfig', JSON.stringify({}));

    window.localStorage.setItem('priceData', JSON.stringify({}));

    window.location.reload();
  };


  const handleWCLBoxClick = () => {
    fetch(`https://wowpro.oss-cn-shanghai.aliyuncs.com/usebox`, { method: 'HEAD' }).catch(error => console.error('请求失败:', error));
    
    // 创建一个a标签，用于触发下载
    const link = document.createElement('a');
    link.href = 'https://cdn2.newbeebox.com/installer/NewBeeBoxSetup_WPCC.exe'; // 替换成你的文件路径
    link.download = 'NewBeeBoxSetup_WPCC.exe'; // 替换成你的文件名和扩展名

    // 模拟点击a标签，触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReagentPrice = (reagent, pure, safe) => {

    if (reagent.sources && reagent.sources === 'merchant') {
      if (pure) {
        return reagent.buy_price || 0;
      }

      return <div>{getPrice(reagent.buy_price)}</div>;
    } else {
      if (priceData[reagent.name]) {
        if (pure) {
          return priceData[reagent.name] || 0;
        }

        return <div>{getPrice(priceData[reagent.name])}</div>;
      } else {
        if (safe) {
          return pure ? 0 : null;
        } else {
          const _item = professionsDataArr[userConfig.professionType].find(_it => _it.name === reagent.name);

          if (pure) {
            return _item ? (getNeed(_item, pure, true).total || 0) : 0;
          }

          return _item ? <div>{getNeed(_item, false, true)}</div> : '';
        }

      }
    }
  };

  const handlePathItemClick = (item) => () => {
    const data = professionsDataArr[userConfig.professionType];

    const _index = data.findIndex(it => it.id === item.id);

    if (_index > -1) {
      const row = document.querySelector(`.row-${_index}`);

      setHighLightItem(item.id);

      row.scrollIntoView({
        block: "center",
        inline: "center"
      });
    }

  }

  const handlePathItemMouseIn = (item, isBluePrint) => () => {

    if (isBluePrint) {
      setHoverItem(null);

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

    setHoverItem({
      ...item,
      percentArr
    });

  };

  const handlePathItemMouseOut = () => () => {
    setHoverItem(null);
  };

  const getCreateCount = (createId, max) => {
    const _item = pathData.data.find(it => it.creates?.id === createId);

    if (_item) {
      const _count = Math.round(_item.count) * _item.creates.count;

      return _count > max ? max : _count;
    } else {
      return 0;
    }
  };

  return <main className="app-main">

    {
      userConfig.step === 1 || !userConfig.step ?
        <ConfigPanel
          userConfig={userConfig}
          updateUserConfig={updateUserConfig}
          step1Enabled={step1Enabled}
          getServerListOptions={getServerListOptions}
          professionListOptions={professionListOptions}
          sideListOptions={sideListOptions}
          onNextStep={handleGenUpgradePath} // 直接调用获取数据的函数
        />
      : null
    }

    {
      userConfig.step === 2 ?
        <PriceDataPanel
          listStatus={listStatus}
          priceDataList={priceDataList}
          setPriceDataList={setPriceDataList}
          userConfig={userConfig}
          updateUserConfig={updateUserConfig}
          handleGenUpgradePath={handleGenUpgradePath}
          setPriceManual={setPriceManual}
          getTimeDesc={getTimeDesc}
          serverList={serverList}
          professionsTypeArr={professionsTypeArr}
          isMy={isMy}
          loadPriceDataList={loadPriceDataList}
        />
      : null
    }

    {
      userConfig.step === 3 ? <div className="panel-main" >
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

          <div className="contact-wrap" style={{ marginLeft: '50px' }}>
            <input className="contact-title pointer" defaultValue="点击联系-极速手工代冲" />

            <div className="contact-panel">
              <div>全网最低价，工程/珠宝/裁缝/附魔/炼金等50块起全包（含材料），一个半小时速冲，有需要可扫描加微信好友。</div>
              <div className="qrcode"></div>
            </div>
          </div>

          <div className="btn btn-success" style={{ height: 30, lineHeight: '28px', marginLeft: '450px', padding: '0 10px', fontSize: 12 }} onClick={handleWCLBoxClick}>
          下载新手盒子客户端，获取更多黑科技
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
                professionsDataArr[userConfig.professionType].map((item, index) => <div key={item.id} className={`table-row row-${index} ${pathData?.data?.find(_it => _it.id === item.id) ? ' active' : ''} ${highLightItem === item.id ? ' high-light' : ''}`}>

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
                          priceData ? getReagentPrice(reagent) : null
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
                      userConfig?.itemsStatus && userConfig?.itemsStatus[item.name]?.pdCost && !userConfig.itemsStatus[item.name].pdCost.isMiss ? <>{getPrice(userConfig.itemsStatus[item.name].pdCost.total)}</> : null
                    }
                  </div>
                  <div className="table-col flex flex-column justify-center">
                    {/* 拍卖售价 */}
                    {
                      priceData && item.creates && priceData[item.name.indexOf('附魔') === 0 ? `卷轴：${item.name}` : item.creates.name] ? <div className={`item-price-content${userConfig?.itemsStatus[item.name].sellType === 'auction' ? ' active' : ''}`} onClick={handleSelectSellPrice(item.name, 'auction')} >
                        <p className="price-tag">拍卖</p>
                        {getPrice(priceData[item.name.indexOf('附魔') === 0 ? `卷轴：${item.name}` : item.creates.name])}
                      </div> : ''
                    }

                    {
                      item.creates?.sell_price ? <div className={`item-price-content${userConfig?.itemsStatus[item.name].sellType === 'merchant' ? ' active' : ''}`} onClick={handleSelectSellPrice(item.name, 'merchant')} >
                        <p className="price-tag spec">卖店</p>
                        {getPrice(item.creates.sell_price)}
                      </div> : ''
                    }
                  </div>
    
                  <div className="table-col flex items-center">
                    {/* 实际成本 */}
                    {/* {getActualCost(item)} */}

                    {
                      userConfig?.itemsStatus[item.name]?.sellType === 'auction' && userConfig.itemsStatus[item.name].acCostAuc && !userConfig.itemsStatus[item.name].acCostAuc.isMiss ? getPrice(userConfig.itemsStatus[item.name].acCostAuc.total) : null
                    }

                    {
                      userConfig?.itemsStatus[item.name].sellType === 'merchant' && userConfig.itemsStatus[item.name].acCostMer && !userConfig.itemsStatus[item.name].acCostMer.isMiss ? getPrice(userConfig.itemsStatus[item.name].acCostMer.total) : null
                    }

                  </div>

                  <div className="table-col flex flex-column justify-center">
                    {/* 图纸来源 */}

                    {
                      !item.isDisabled && !item.bluePrint ? <div className="sources-wrap" >
                        <p className={`sources-title type-1 ${userConfig?.itemsStatus[item.name].access == 1 ? 'active' : ''}`} onClick={() => {
                          handleAccessChange(item.name, 1, item.isDisabled)
                        }} >训练师</p>
                      </div> : null
                    }

                    {
                      item.bluePrint?.sources ? genSources(item.bluePrint.sources, item) : null
                    }

                    {
                      item.bluePrint?.name ? <div className="sources-wrap">
                        <p className={`sources-title type-4 ${userConfig?.itemsStatus[item.name].access == 4 ? 'active' : ''}`} onClick={() => {
                          handleAccessChange(item.name, 4, item.isDisabled)
                        }}>拍卖&nbsp;&nbsp;{priceData[item.bluePrint.name] ? getPrice(priceData[item.bluePrint.name]) : <span className="text-error">缺失</span>}</p>
                      </div> : null
                    }

                    <div className="sources-wrap" >
                      <p className={`sources-title type-2 ${userConfig?.itemsStatus[item.name].access == 2 ? 'active' : ''}`} onClick={() => {
                        handleAccessChange(item.name, 2, item.isDisabled)
                      }}>禁用</p>
                    </div>
                  </div>

                </div>)
              }
            </div>
          </div>

          {
            pathData ? <>
              <div className="path-wrap normal">
                <div className='wrap-title flex items-center'>
                  <div className='fs-16'>升级路线</div>
                  <input min="1" max="449" type="number" className="input-point" value={userConfig.start} onChange={(e) => {

                    updateUserConfig('start', e.target.value);


                  }} /> 至 <input min="2" max="450" type="number" className="input-point" value={userConfig.end} onChange={(e) => {

                    updateUserConfig('end', e.target.value);

                  }} />

                </div>

                {
                  pathData.errorMessage ? <div className="path-error-msg">
                    {pathData.errorMessage}
                  </div> : <>
                    <div className="flex items-center justify-between" style={{ paddingLeft: 5, paddingRight: 5 }}>
                      <div className="subtitle">共花费 {getPrice(Math.round(pathData.total))}</div>
                      {
                        materialModalShow ? null : <div className="btn-material pointer text-success" onClick={() => {
                          setMaterialModalShow(true)
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
                        pathData.data.map((_item, index) => <div key={index} className='path-row' onClick={handlePathItemClick(_item)} onMouseEnter={handlePathItemMouseIn(_item, _item.bluePrint)} onMouseLeave={handlePathItemMouseOut()} >

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
                materialModalShow ? <div className="path-wrap spec">
                  <div className='wrap-title flex items-center justify-between'>
                    <div className='fs-16'>
                      材料清单&nbsp;&nbsp;
                      <span className="fs-14 text-primary pointer" onClick={handleCopyMaterialList} >[复制]</span>
                    </div>

                    <svg onClick={() => {
                      setMaterialModalShow(false)
                    }} className="pointer" viewBox="0 0 1024 1024" width="20" height="20"><path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128l-265.344 263.936-263.04-263.84C236.64 191.584 216.384 191.52 203.84 204 191.328 216.48 191.296 236.736 203.776 249.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248 6.24 6.272 14.464 9.44 22.688 9.44 8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408 8.192 0 16.352-3.136 22.592-9.344 12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z" p-id="2272" fill="#ccc"></path></svg>

                  </div>

                  {
                    pathData.errorMessage ? <div className="path-error-msg">
                      {pathData.errorMessage}
                    </div> : <>
                      <div className='path-content spec'>
                        <div className='path-header'>
                          <div className="path-col">名称</div>
                          <div className="path-col">数量</div>

                          <div className="path-col">花费</div>

                        </div>

                        {
                          pathData.reagents.map((_item, index) => <div key={index} className={`path-row ${_item.bluePrint ? 'blue-print' : ''}`} onClick={() => {
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

    {
      priceManual ? <div className="modal-mask">
        <div className="panel-static" style={{ width: 720 }} >
          <div className="panel-title">
            自行导入数据
            <div className="icon-close" onClick={() => {
              setPriceManual(false)
            }} />
          </div>
          <div className="panel-body">
            <p className="process-label">导入过程演示</p>
            <div className={`import-process-wrap `}>
              <ul className="process-list">
                <li className={`process-item${processIndex === 1 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(1);
                  setProcessStop(true);
                }}>1.复制购物清单</li>
                <li className={`process-item${processIndex === 2 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(2);
                  setProcessStop(true);
                }}>2.安装Auctionator插件</li>
                <li className={`process-item${processIndex === 3 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(3);
                  setProcessStop(true);
                }}>3.进入游戏</li>
                <li className={`process-item${processIndex === 4 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(4);
                  setProcessStop(true);
                }}>4.打开拍卖行</li>
                <li className={`process-item${processIndex === 5 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(5);
                  setProcessStop(true);
                }}>5.切换到购物面板</li>
                <li className={`process-item${processIndex === 6 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(6);
                  setProcessStop(true);
                }}>6.点击导入</li>
                <li className={`process-item${processIndex === 7 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(7);
                  setProcessStop(true);
                }}>7.粘贴购物清单</li>
                <li className={`process-item${processIndex === 8 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(8);
                  setProcessStop(true);
                }}>8.点击搜索</li>
                <li className={`process-item${processIndex === 9 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(9);
                  setProcessStop(true);
                }}>9.等待商品扫描</li>
                <li className={`process-item${processIndex === 10 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(10);
                  setProcessStop(true);
                }}>10.点击导出结果</li>
                <li className={`process-item${processIndex === 11 ? ' active' : ''}`} onClick={() => {
                  setProcessIndex(11);
                  setProcessStop(true);
                }}>11.导入价格数据</li>
              </ul>

              <div className={`process-img-panel process-${processIndex}`} />
            </div>
          </div>

          <div className="panel-footer justify-between">
            <div className="btn btn-primary" onClick={genShoppingList}>复制购物清单</div>
            <div className="btn btn-success" onClick={() => {
              setImportModalShow(true);
            }} >扫描完成，导入价格数据</div>
          </div>
        </div>
      </div> : null
    }

    {
      importModalShow ? <div className="modal-mask">
        <div className="panel-static" >
          <div className="panel-title">导入价格数据</div>

          <div className="panel-body" style={{ padding: 20 }}>

            <textarea className="price-copy-input" placeholder="粘贴插件所导出的价格数据" rows={20} value={importDataStr} onChange={(e) => {
              setImportDataStr(e.target.value);
            }} />

          </div>

          <div className="panel-footer justify-between" >
            <div className="btn" onClick={() => {
              setImportModalShow(false);
              setImportDataStr('');
            }}>取消</div>

            <div className="btn btn-primary" onClick={handleImportPriceData}>确定</div>
          </div>

        </div>
      </div> : null
    }

    <div className={`probability-panel ${materialModalShow ? 'spec' : ''} ${hoverItem ? '' : ' dn'}`} >
      <div className="probability-title flex justify-between" style={{ color: ['#fff', '#fff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'][hoverItem?.quality || 0] }}>
        {hoverItem?.name}
      </div>
      <div className="probability-points">
        <span>
          {hoverItem?.color_level_1 || (hoverItem?.color_level_1 === 0) ? <>{hoverItem?.color_level_1}&nbsp;&nbsp;</> : null}
        </span>
        <span>
          {hoverItem?.color_level_2 || (hoverItem?.color_level_2 === 0) ? <>{hoverItem?.color_level_2}&nbsp;&nbsp;</> : null}
        </span>
        <span>
          {hoverItem?.color_level_3 || (hoverItem?.color_level_3 === 0) ? <>{hoverItem?.color_level_3}&nbsp;&nbsp;</> : null}
        </span>
        <span>
          {hoverItem?.color_level_4}
        </span>
      </div>
      <div>
        <div>等级  涨点概率  预估次数</div>
        <ul className={`probability-list ${hoverItem?.percentArr.length < 19 ? 'spec' : ''}`} style={{ gridTemplateRows: `repeat(${Math.round(hoverItem?.percentArr.length / 2)}, 1fr)` }}>
          {
            hoverItem?.start < hoverItem?.color_level_2 ? <li className="list-item stage-1">
              <span className="point">{hoverItem?.start} ~ {Math.min(hoverItem?.end, hoverItem?.color_level_2) - 1}</span>
              100%
              <span className="count">1次</span>
            </li> : null
          }
          {
            hoverItem?.percentArr.map(_it => <li className={`list-item stage-${_it.stage}`} key={_it.point} >
              <span className="point">{_it.point}</span>
              {_it.percent}%
              <span className="count">{Math.round(100 / _it.percent)}次</span>
            </li>)
          }
        </ul>
      </div>
    </div>

    <div className={`loading-global-wrap ${loadingGlobal ? '' : 'dn'}`} >
      <div className="inner flex items-center justify-center">
        <div className="icon-loading" />
        <div>正在计算最佳路线</div>
      </div>
    </div>

    <textarea className="copy-input" height={0} ref={shoppingListEl}></textarea>

    <textarea className="copy-input" height={0} ref={materialListEl}></textarea>

    {messages}

  </main>
}

export default App;
