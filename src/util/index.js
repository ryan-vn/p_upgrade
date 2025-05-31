export const getTimeDesc = (time) => {

    let result = '';

    const minute = 1000 * 60;      //把分，时，天，周，半个月，一个月用毫秒表示

    const hour = minute * 60;

    const day = hour * 24;

    const week = day * 7;

    // const halfamonth = day * 15;

    const month = day * 30;

    const now = new Date().getTime();   //获取当前时间毫秒

    const diffValue = now - time;   //时间差

    if(diffValue < 0){
        return;
    }

    const minC = Math.floor(diffValue / minute);  //计算时间差的分，时，天，周，月

    const hourC =  Math.floor(diffValue / hour);

    const dayC =  Math.floor(diffValue / day);

    const weekC =  Math.floor(diffValue / week);

    const monthC =  Math.floor(diffValue / month);

    if (monthC >= 1 && monthC <= 3) {

        result = " " + parseInt(monthC) + "月前";

    } else if (weekC >= 1 && weekC <= 3) {

        result = " " + parseInt(weekC) + "周前";

    } else if (dayC >= 1 && dayC <= 6) {

        result = " " + parseInt(dayC) + "天前";

    } else if (hourC >= 1 && hourC <= 23) {

        result = " " + parseInt(hourC) + "小时前";

    } else if (minC >= 1 && minC <= 59) {

        result =" " + parseInt(minC) + "分钟前";

    } else if (diffValue >= 0 && diffValue <= minute) {

        result = "刚刚";

    } else {

        const datetime = new Date(time);

        const Nyear = datetime.getFullYear();

        const Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;

        const Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();

        // const Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();

        // const Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();

        // const Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();

        result = Nyear + "-" + Nmonth + "-" + Ndate;
    }

    return result;
};


// 随机字符串
export const randomString = (len = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    const maxPos = chars.length;
  
    let str = '';
  
    for (let i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
  
    return str;
  };
  
  export const getUserId = () => {
    let _userId = window.localStorage.getItem('userId');
  
    if (_userId) {
      return _userId;
    } else {
      _userId = randomString(12);
  
      window.localStorage.setItem('userId', _userId);
  
      return _userId;
  
    }
  
  };
  
  export const isMy = (id) => {
    return id === window.localStorage.getItem('userId');
  };

  // export const serverListGlobal = [
  //   {
  //     group: '台服',
  //     name: '伊弗斯',
  //     type: 'PVP'
  //   },
  //   {
  //     group: '台服',
  //     name: '玛拉顿',
  //     type: 'PVE'
  //   },
  //   {
  //     group: '全球服',
  //     name: '阿拉希盆地',
  //     type: 'PVP'
  //   },
  //   {
  //     group: '全球服',
  //     name: '鱼人',
  //     type: 'PVE'
  //   }
  // ];
  
  export const serverList = [
    {
        "id": 1,
        "name": "吉安娜",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1737547301,
        "allianceScanTime": 1737547138,
        "hordeScanTotal": 165233,
        "allianceScanTotal": 59740
    },
    {
        "id": 2,
        "name": "死亡猎手",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736385531,
        "allianceScanTime": 1736490166,
        "hordeScanTotal": 152116,
        "allianceScanTotal": 29741
    },
    {
        "id": 3,
        "name": "红玉圣殿",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736386840,
        "allianceScanTime": 1736386476,
        "hordeScanTotal": 145515,
        "allianceScanTotal": 75765
    },
    {
        "id": 4,
        "name": "哈霍兰",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1737547399,
        "hordeScanTotal": null,
        "allianceScanTotal": 109138
    },
    {
        "id": 5,
        "name": "辛洛斯",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1728557017,
        "allianceScanTime": 1730428337,
        "hordeScanTotal": 100727,
        "allianceScanTotal": 29629
    },
    {
        "id": 6,
        "name": "辛迪加",
        "group": "一区",
        "groupId": 1,
        "type": "RPPVP",
        "hordeScanTime": null,
        "allianceScanTime": 1727593796,
        "hordeScanTotal": null,
        "allianceScanTotal": 65143
    },
    {
        "id": 7,
        "name": "火锤",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736385547,
        "hordeScanTotal": null,
        "allianceScanTotal": 62524
    },
    {
        "id": 8,
        "name": "霜语",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736394443,
        "allianceScanTime": null,
        "hordeScanTotal": 129700,
        "allianceScanTotal": null
    },
    {
        "id": 9,
        "name": "巫妖王",
        "group": "一区",
        "groupId": 1,
        "type": "普通",
        "hordeScanTime": 1736383974,
        "allianceScanTime": 1736383784,
        "hordeScanTotal": 91557,
        "allianceScanTotal": 60692
    },
    {
        "id": 10,
        "name": "无敌",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": null,
        "hordeScanTotal": null,
        "allianceScanTotal": null
    },
    {
        "id": 11,
        "name": "无畏",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736384279,
        "allianceScanTime": 1736384456,
        "hordeScanTotal": 116933,
        "allianceScanTotal": 59765
    },
    {
        "id": 12,
        "name": "伦鲁迪洛尔",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729757651,
        "allianceScanTime": null,
        "hordeScanTotal": 41011,
        "allianceScanTotal": null
    },
    {
        "id": 13,
        "name": "光芒",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729757739,
        "allianceScanTime": null,
        "hordeScanTotal": 54829,
        "allianceScanTotal": null
    },
    {
        "id": 14,
        "name": "克罗米",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730428884,
        "hordeScanTotal": null,
        "allianceScanTotal": 30508
    },
    {
        "id": 15,
        "name": "寒脊山小径",
        "group": "一区",
        "groupId": 1,
        "type": "普通",
        "hordeScanTime": null,
        "allianceScanTime": 1736388019,
        "hordeScanTotal": null,
        "allianceScanTotal": 57789
    },
    {
        "id": 16,
        "name": "希尔盖",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729757851,
        "allianceScanTime": null,
        "hordeScanTotal": 43136,
        "allianceScanTotal": null
    },
    {
        "id": 17,
        "name": "德姆塞卡尔",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730429065,
        "hordeScanTotal": null,
        "allianceScanTotal": 62281
    },
    {
        "id": 18,
        "name": "怀特迈恩",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730429186,
        "hordeScanTotal": null,
        "allianceScanTotal": 30398
    },
    {
        "id": 19,
        "name": "末日之刃",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729758045,
        "allianceScanTime": null,
        "hordeScanTotal": 55122,
        "allianceScanTotal": null
    },
    {
        "id": 20,
        "name": "毁灭之刃",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729758128,
        "allianceScanTime": null,
        "hordeScanTotal": 52199,
        "allianceScanTotal": null
    },
    {
        "id": 21,
        "name": "水晶之牙",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729758264,
        "allianceScanTime": null,
        "hordeScanTotal": 64060,
        "allianceScanTotal": null
    },
    {
        "id": 22,
        "name": "沙尔图拉",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729759531,
        "allianceScanTime": null,
        "hordeScanTotal": 62968,
        "allianceScanTotal": null
    },
    {
        "id": 23,
        "name": "沙顶",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729756827,
        "allianceScanTime": null,
        "hordeScanTotal": 36236,
        "allianceScanTotal": null
    },
    {
        "id": 24,
        "name": "法琳娜",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730429284,
        "hordeScanTotal": null,
        "allianceScanTotal": 53387
    },
    {
        "id": 25,
        "name": "艾隆纳亚",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730429714,
        "hordeScanTotal": null,
        "allianceScanTotal": 37575
    },
    {
        "id": 26,
        "name": "诺格弗格",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729759774,
        "allianceScanTime": null,
        "hordeScanTotal": 74058,
        "allianceScanTotal": null
    },
    {
        "id": 27,
        "name": "骨火",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729759865,
        "allianceScanTime": null,
        "hordeScanTotal": 33167,
        "allianceScanTotal": null
    },
    {
        "id": 28,
        "name": "黑曜石之锋",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729756971,
        "allianceScanTime": null,
        "hordeScanTotal": 32791,
        "allianceScanTotal": null
    },
    {
        "id": 29,
        "name": "龙牙",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1737198170,
        "allianceScanTime": 1738810429,
        "hordeScanTotal": 252871,
        "allianceScanTotal": 41954
    },
    {
        "id": 30,
        "name": "加丁",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1734937506,
        "allianceScanTime": 1736384696,
        "hordeScanTotal": 53529,
        "allianceScanTotal": 63408
    },
    {
        "id": 31,
        "name": "埃提耶什",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736393681,
        "allianceScanTime": null,
        "hordeScanTotal": 87917,
        "allianceScanTotal": null
    },
    {
        "id": 32,
        "name": "奥罗",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736385233,
        "allianceScanTime": null,
        "hordeScanTotal": 93239,
        "allianceScanTotal": null
    },
    {
        "id": 33,
        "name": "怒炉",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1727764028,
        "allianceScanTime": 1736389401,
        "hordeScanTotal": 1,
        "allianceScanTotal": 80807
    },
    {
        "id": 34,
        "name": "碧玉矿洞",
        "group": "一区",
        "groupId": 1,
        "type": "普通",
        "hordeScanTime": 1736387337,
        "allianceScanTime": 1736387141,
        "hordeScanTotal": 40159,
        "allianceScanTotal": 57263
    },
    {
        "id": 35,
        "name": "祈福",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736392598,
        "hordeScanTotal": null,
        "allianceScanTotal": 122608
    },
    {
        "id": 36,
        "name": "维克洛尔",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736387670,
        "allianceScanTime": null,
        "hordeScanTotal": 82934,
        "allianceScanTotal": null
    },
    {
        "id": 37,
        "name": "莫格莱尼",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1737211237,
        "hordeScanTotal": null,
        "allianceScanTotal": 131101
    },
    {
        "id": 38,
        "name": "萨弗拉斯",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1731007747,
        "allianceScanTime": null,
        "hordeScanTotal": 89670,
        "allianceScanTotal": null
    },
    {
        "id": 39,
        "name": "震地者",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736385905,
        "allianceScanTime": null,
        "hordeScanTotal": 86873,
        "allianceScanTotal": null
    },
    {
        "id": 40,
        "name": "龙之召唤",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736393285,
        "allianceScanTime": null,
        "hordeScanTotal": 102512,
        "allianceScanTotal": null
    },
    {
        "id": 41,
        "name": "奥金斧",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1736388474,
        "allianceScanTime": 1728885291,
        "hordeScanTotal": 105630,
        "allianceScanTotal": 1
    },
    {
        "id": 42,
        "name": "席瓦莱恩",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1729757326,
        "allianceScanTime": null,
        "hordeScanTotal": 139774,
        "allianceScanTotal": null
    },
    {
        "id": 43,
        "name": "灰烬使者",
        "group": "一区",
        "groupId": 1,
        "type": "PVP",
        "hordeScanTime": 1733984421,
        "allianceScanTime": null,
        "hordeScanTotal": 112397,
        "allianceScanTotal": null
    },
    {
        "id": 44,
        "name": "秩序之源",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1729764642,
        "allianceScanTime": null,
        "hordeScanTotal": 47248,
        "allianceScanTotal": null
    },
    {
        "id": 45,
        "name": "狮心",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736389527,
        "hordeScanTotal": null,
        "allianceScanTotal": 98801
    },
    {
        "id": 46,
        "name": "巨龙追猎者",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": null,
        "hordeScanTotal": null,
        "allianceScanTotal": null
    },
    {
        "id": 47,
        "name": "觅心者",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736387572,
        "allianceScanTime": null,
        "hordeScanTotal": 51584,
        "allianceScanTotal": null
    },
    {
        "id": 48,
        "name": "匕首岭",
        "group": "五区",
        "groupId": 5,
        "type": "普通",
        "hordeScanTime": null,
        "allianceScanTime": 1736387242,
        "hordeScanTotal": null,
        "allianceScanTotal": 95925
    },
    {
        "id": 49,
        "name": "布鲁",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736387995,
        "allianceScanTime": null,
        "hordeScanTotal": 97792,
        "allianceScanTotal": null
    },
    {
        "id": 50,
        "name": "帕奇维克",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736553821,
        "allianceScanTime": null,
        "hordeScanTotal": 98690,
        "allianceScanTotal": null
    },
    {
        "id": 51,
        "name": "维希度斯",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736989940,
        "allianceScanTime": null,
        "hordeScanTotal": 99994,
        "allianceScanTotal": null
    },
    {
        "id": 52,
        "name": "范克瑞斯",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736393766,
        "hordeScanTotal": null,
        "allianceScanTotal": 88301
    },
    {
        "id": 53,
        "name": "冰封王座",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1729761838,
        "allianceScanTime": 1727590345,
        "hordeScanTotal": 35045,
        "allianceScanTotal": 9603
    },
    {
        "id": 54,
        "name": "银色北伐军",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736386115,
        "allianceScanTime": 1736385895,
        "hordeScanTotal": 53776,
        "allianceScanTotal": 78135
    },
    {
        "id": 55,
        "name": "赫洛德",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": null,
        "hordeScanTotal": null,
        "allianceScanTotal": null
    },
    {
        "id": 56,
        "name": "卓越",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1731067143,
        "allianceScanTime": null,
        "hordeScanTotal": 93287,
        "allianceScanTotal": null
    },
    {
        "id": 57,
        "name": "厄运之槌",
        "group": "五区",
        "groupId": 5,
        "type": "普通",
        "hordeScanTime": 1729762775,
        "allianceScanTime": 1730425627,
        "hordeScanTotal": 37067,
        "allianceScanTotal": 22015
    },
    {
        "id": 58,
        "name": "奎尔塞拉",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1729763019,
        "allianceScanTime": null,
        "hordeScanTotal": 62452,
        "allianceScanTotal": null
    },
    {
        "id": 59,
        "name": "娅尔罗",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730425685,
        "hordeScanTotal": null,
        "allianceScanTotal": 24439
    },
    {
        "id": 60,
        "name": "安娜丝塔丽",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736384228,
        "hordeScanTotal": null,
        "allianceScanTotal": 31725
    },
    {
        "id": 61,
        "name": "测试",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": null,
        "hordeScanTotal": null,
        "allianceScanTotal": null
    },
    {
        "id": 62,
        "name": "巴罗夫",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1729763774,
        "allianceScanTime": null,
        "hordeScanTotal": 64456,
        "allianceScanTotal": null
    },
    {
        "id": 63,
        "name": "无尽风暴",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1729764472,
        "allianceScanTime": null,
        "hordeScanTotal": 70634,
        "allianceScanTotal": null
    },
    {
        "id": 64,
        "name": "曼多基尔",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730426154,
        "hordeScanTotal": null,
        "allianceScanTotal": 60102
    },
    {
        "id": 65,
        "name": "湖畔镇",
        "group": "五区",
        "groupId": 5,
        "type": "普通",
        "hordeScanTime": null,
        "allianceScanTime": 1730426529,
        "hordeScanTotal": null,
        "allianceScanTotal": 42754
    },
    {
        "id": 66,
        "name": "灵风",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": null,
        "hordeScanTotal": null,
        "allianceScanTotal": null
    },
    {
        "id": 67,
        "name": "狂野之刃",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": null,
        "hordeScanTotal": null,
        "allianceScanTotal": null
    },
    {
        "id": 68,
        "name": "维克尼拉斯",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1727766503,
        "allianceScanTime": null,
        "hordeScanTotal": 65417,
        "allianceScanTotal": null
    },
    {
        "id": 69,
        "name": "范沃森",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1730426884,
        "hordeScanTotal": null,
        "allianceScanTotal": 47593
    },
    {
        "id": 70,
        "name": "审判",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1727548109,
        "allianceScanTime": 1736394194,
        "hordeScanTotal": 6967,
        "allianceScanTotal": 70397
    },
    {
        "id": 71,
        "name": "寒冰之王",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736384485,
        "hordeScanTotal": null,
        "allianceScanTotal": 45543
    },
    {
        "id": 72,
        "name": "比斯巨兽",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736392637,
        "allianceScanTime": null,
        "hordeScanTotal": 67439,
        "allianceScanTotal": null
    },
    {
        "id": 73,
        "name": "比格沃斯",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736388776,
        "allianceScanTime": null,
        "hordeScanTotal": 90350,
        "allianceScanTotal": null
    },
    {
        "id": 74,
        "name": "法尔班克斯",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736389136,
        "hordeScanTotal": null,
        "allianceScanTotal": 90035
    },
    {
        "id": 75,
        "name": "碧空之歌",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1727743650,
        "allianceScanTime": 1736392933,
        "hordeScanTotal": 9285,
        "allianceScanTotal": 49841
    },
    {
        "id": 76,
        "name": "雷德",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": null,
        "allianceScanTime": 1736384887,
        "hordeScanTotal": null,
        "allianceScanTotal": 53447
    },
    {
        "id": 77,
        "name": "雷霆之击",
        "group": "五区",
        "groupId": 5,
        "type": "PVP",
        "hordeScanTime": 1736383988,
        "allianceScanTime": null,
        "hordeScanTotal": 79036,
        "allianceScanTotal": null
    },
    {
        "id": 1001,
        "name": "无情",
        "group": "经典60",
        "groupId": 60,
        "type": "PVP",
        "hordeScanTime": 1736383988,
        "allianceScanTime": null,
        "hordeScanTotal": 79036,
        "allianceScanTotal": null
    },
    {
        "id": 1002,
        "name": "硬汉",
        "group": "经典60",
        "groupId": 60,
        "type": "PVP",
        "hordeScanTime": 1736383988,
        "allianceScanTime": null,
        "hordeScanTotal": 79036,
        "allianceScanTotal": null
    },
    {
        "id": 1004,
        "name": "铁血",
        "group": "经典60",
        "groupId": 60,
        "type": "PVP",
        "hordeScanTime": 1736383988,
        "allianceScanTime": null,
        "hordeScanTotal": 79036,
        "allianceScanTotal": null
    },
    {
        "id": 1003,
        "name": "铁血II",
        "group": "经典60",
        "groupId": 60,
        "type": "PVP",
        "hordeScanTime": 1736383988,
        "allianceScanTime": null,
        "hordeScanTotal": 79036,
        "allianceScanTotal": null
    }
]
  

  export const getServerListOptions = () => {
    const _options = serverList.map((server, index) => ({
      key: `${server.group}  ${server.name}(${server.type})`,
      value: index,
    }));

    return _options;
  };

  export const sideListOptions = [
    {
      key: '联盟',
      value: 0,
    },
    {
      key: '部落',
      value: 1,
    }
  ];

  // "1": cooking,
  // "2": alchemy,
  // "3": blacksmithing,
  // "4": engineering,
  // "5": inscription,
  // "6": jewel,
  // "7": tailoring,
  // "8": leatherworking,
  // "9": enchanting,
  export const professionListOptions = [
    {
      key: '烹饪',
      value: 1,
      icon: 'inv_misc_food_15',
    },
    {
      key: '炼金术',
      value: 2,
      icon: 'trade_alchemy',
    },
    {
      key: '锻造',
      value: 3,
      icon: 'trade_blacksmithing',
    },
    {
      key: '工程学',
      value: 4,
      icon: 'trade_engineering',
    },
    {
      key: '铭文',
      value: 5,
      icon: 'inv_inscription_tradeskill01',
    },
    {
      key: '珠宝加工',
      value: 6,
      icon: 'inv_misc_gem_01',
    },
    {
      key: '裁缝',
      value: 7,
      icon: 'trade_tailoring',
    },
    {
      key: '制皮',
      value: 8,
      icon: 'inv_misc_armorkit_17',
    },
    {
      key: '附魔',
      value: 9,
      icon: 'trade_engraving',
    }
  ];

//   const getProfessionDataFromDatabase = async () => {
//     const [data1, data2, data3, data4, dataNpcCn, dataNpc, dataStatic] = await getProfessionSkills();
  
//     let _professionData = [];
  
//     data2.forEach((item, index) => {
//       if (item.type === 185) {
  
//         // 发现需要到拍卖行购买图纸，则纳入到列表
//         const bluePrint = bluePrints.find(_it => _it.name === `食谱：${data1[index].name}`);
  
//         let _index;
  
//         if (bluePrint) {
  
//           _index = data4.findIndex(_it => _it.name === bluePrint.name);
  
//         }
  
//         const bluePrintData = bluePrint ? {
//           ...data3[_index],
//           ...data4[_index]
//         } : null;
  
//         if (bluePrintData && bluePrintData.sources) {
//           bluePrintData.sources = bluePrintData.sources.map(_bp => {
  
//             let args = {};
  
//             if (_bp.npc_id) {
//               const _indexNpc = dataNpcCn.findIndex(_it => _it.id === _bp.npc_id);
  
//               args = {
//                 ...dataNpc[_indexNpc],
//                 ...dataNpcCn[_indexNpc],
//                 locations: dataNpc[_indexNpc].locations ? dataNpc[_indexNpc].locations.map(_loc => ({
//                   ..._loc,
//                   zone: dataStatic['zones'].find(_it => _it.id === _loc.zone_id).name
//                 })) : undefined
//               };
//             }
  
//             return {
//               ..._bp,
//               ...args
//             };
//           });
//         }
  
//         if (item.reagents) {
//           _professionData.push({
//             ...item,
//             name: data1[index].name,
//             creates: item.creates ? {
//               id: item.creates.item_id,
//               count: item.creates.item_count,
//               ...data3.find(_it => _it.id === item.creates.item_id),
//               ...data4.find(_it => _it.id === item.creates.item_id)
//             } : undefined
//             ,
//             isChecked: true,
//             isDisabled: false,
//             bluePrint: bluePrintData,
//             reagents: item.reagents ? item.reagents.map((reagent) => {
  
//               const _targetItemIndex = data3.findIndex(_that => _that.id === reagent.item_id);
  
//               return {
//                 ...data3[_targetItemIndex],
//                 count: reagent.item_count,
//                 ...data4[_targetItemIndex]
//               };
  
//             }) : []
//           });
//         }
  
//       }
//     });
  
//     _professionData = _professionData.sort((a, b) => a.learned_at_rank - b.learned_at_rank);
  
//     console.log(JSON.stringify(_professionData));
  
//   };



// bluePrint  sources
// {type: 1, min_level: 5, max_level: 34}  世界掉落
// npc 售卖
// {
//   "type": 7,
//   "npc_id": 2682,
//   "cost": {
//       "money": 1000
//   },
//   "available_count": 1,
//   "id": 2682,
//   "name": "弗拉德",
//   "classification": 0,
//   "min_level": 24,
//   "max_level": 24,
//   "react_to_alliance": 1,
//   "react_to_horde": -1,
//   "locations": [
//       {
//           "zone_id": 11,
//           "ranges": [
//               [
//                   [
//                       26.4,
//                       25.8
//                   ]
//               ]
//           ],
//           "zone": "湿地"
//       }
//   ],
//   "tag": "工程学供应商"
// }
// 
// 

// 去除冗余sources信息
// console.log(JSON.stringify(cookingData.map(_it => {
//   return {
//     ..._it,
//     creates: {
//       ..._it.creates,
//       sources: _it.creates && _it.creates.sources && _it.creates.sources.length > 20 && _it.creates.sources[10].type === 3 && !_it.creates.sources[10].available_count ? 'merchant' : 'auction',
//     },
//     reagents: _it.reagents.map(_reagent => ({
//       ..._reagent,
//       sources: _reagent && _reagent.sources && _reagent.sources.length > 20 && _reagent.sources[10].type === 3 && !_reagent.sources[10].available_count ? 'merchant' : 'auction',
//     }))
//   }
// })));

// const genBluePrint = (type, keyword) => {
//   const data = professionsDataArr[type];

//   console.log(data.map(item => {
//     const bluePrint = itemsData.find(_it => _it.name === `${keyword}：${item.name}`);

//     // console.log((bluePrint?.sources || []).map(it => it.type).join('#'));
//     console.log((bluePrint?.sources || []), item.name);

//     return {
//       ...item,
//       bluePrint: bluePrint || null,
//     };
//   }));
// }

// genBluePrint(8, '食谱');


// const simplifyData = (type) => {
//   const data = professionsDataArr[type];

//   console.log(data.map(dataItem => {
//     const { id, name, icon, color_level_1, color_level_2, color_level_3, color_level_4, creates, reagents, isChecked, isDisabled } = dataItem;

//     let bluePrint = dataItem.bluePrint;

//     if (bluePrint?.sources) {

//       bluePrint.sources = bluePrint.sources.map(_bp => {

//         let args = {};

//         // zone_id
//         if (_bp.zone_id) {
//           _bp.zoneName = dataStatic['zones'].find(_it => _it.id === _bp.zone_id).name;
//         }

//         // npc_id

//         if (_bp.npc_id) {
//           const _npc = npcsData.find(_np => _np.id === _bp.npc_id);

//           args.npcName = _npc?.name || undefined;

//           args.npcZones = _npc.locations ? _npc.locations.map(_loc => dataStatic['zones'].find(_it => _it.id === _loc.zone_id).name) : undefined;

//         }

//         // quest_id
//         if (_bp.quest_id) {
//           const _quest = questsData.find(_q => _q.id === _bp.quest_id);

//           if (_quest) {
//             args.questName = _quest.name;

//             if (_quest.objectives) {
//               // 世界事件相关信息
//               const _qo = _quest.objectives.map(({ item_id }) => (wordEventsData.find(it => !!it.item_ids.find(_id => _id === item_id)) || { name: '' }).name).filter(it => !!it);

//               if (_qo.length) {
//                 args.questObjectives = _qo;
//               }
//             }
//           }
//         }

//         // item_id

//         if (_bp.item_id) {
//           const _item = itemsData.find(_it => _it.id === _bp.item_id);

//           args.itemName = _item?.name || undefined;

//           const event = wordEventsData.find(it => !!it.item_ids.find(_id => _id === bluePrint.id));

//           if (event) {
//             args.itemEventName = event.name;
//           }

//         }

//         // object_id

//         if (_bp.object_id) {
//           const _obj = objectsData.find(_ob => _ob.id === _bp.object_id);

//           if (_obj) {
//             args.objName = _obj.name;

//             if (_obj.locations) {
//               args.objLocations = _obj.locations.map(_loc => dataStatic['zones'].find(_it => _it.id === _loc.zone_id).name);
//             }
//           }
//         }

//         if (_bp.skill_id) {
//           // spells type
//           const spell = spellsData.find(item => item.id === _bp.skill_id);

//           if (spell && spell.type) {
//             const _type = spell.type.split('.').slice(-1);
//             args.spellName = dataStatic.professionTypes.find(it => it.id == _type)?.name || '';
//           }

//         }

//         return {
//           ..._bp,
//           ...args
//         };

//       });

//     }

//     if (bluePrint) {
//       bluePrint = {
//         id: bluePrint.id,
//         icon: bluePrint.icon,
//         name: bluePrint.name,
//         quality: bluePrint.quality,
//         sources: bluePrint.sources,
//       };
//     }

//     return {
//       id,
//       name,
//       icon,
//       color_level_1,
//       color_level_2,
//       color_level_3,
//       color_level_4,
//       isChecked,
//       isDisabled,
//       creates: creates ? {
//         id: creates.id,
//         count: creates.count,
//         name: creates.name,
//         icon: creates.icon,
//         quality: creates.quality,
//         item_level: creates.item_level,
//         buy_price: creates.buy_price,
//         sell_price: creates.sell_price,
//         sources: creates.sources
//       } : undefined,
//       reagents: reagents ? reagents.map(it => ({
//         id: it.id,
//         count: it.count,
//         name: it.name,
//         icon: it.icon,
//         quality: it.quality,
//         item_level: it.item_level,
//         buy_price: it.buy_price,
//         sell_price: it.sell_price,
//         sources: it.sources
//       })) : undefined,
//       bluePrint: bluePrint || undefined,
//     };
//   }));
// };

// simplifyData(8);


// const processSourcesTypes = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {
//     if (item.bluePrint && item.bluePrint.sources) {
//       let sourcesType = [1,2,4];

//       let defaultAccess = 4;

//       item.bluePrint.sources.forEach(_source => {
//         if (_source.type === 3 && (sourcesType.indexOf(3) === -1)) {
//           sourcesType.splice(2, 0, 3);

//           defaultAccess = 3;
//         }

//         if (_source.type === 4) {
//           defaultAccess = 1;
//         }
//       });

//       return {
//         ...item,
//         bluePrint: {
//           ...item.bluePrint,
//         },
//         sourcesType,
//         defaultAccess: item.isDisabled ? 2 : (item.isChecked ? defaultAccess : 2),
//       };

//     } else {
//       // 无图纸需求，默认启用  若为禁用状态则默认禁用
//       return {
//         ...item,
//         sourcesType: [1,2],
//         defaultAccess: item.isDisabled ? 2 : 1,
//       };
//     }
//   }));

// };

// processSourcesTypes(8);


// const processSourcesTypes = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {
//     if (item.bluePrint && item.bluePrint.sources) {
//       // 将 sources 按照 types 归类处理

//       // 固定顺序，分别为 商人购买 其它
//       let sources = [null, null];

//       let defaultAccess = item.defaultAccess;

//       item.bluePrint.sources.forEach(_source => {

//         if (_source.type === 3) {
//           if (sources[0]) {
//             sources[0].push(_source);
//           } else {
//             sources[0] = [_source];
//           }
//         } else {
//           if (_source.type === 4 && !item.isDisabled) {
//             defaultAccess = 5;
//           }
//           if (sources[1]) {
//             sources[1].push(_source);
//           } else {
//             sources[1] = [_source];
//           }
//         }

//       });

//       return {
//         ...item,
//         bluePrint: {
//           ...item.bluePrint,
//           sources
//         },
//         defaultAccess,
//       };

//     } else {
//       return item;
//     }
//   }));

// };

// processSourcesTypes(8);

// 处理数据，将 sources 类型枚举出来

// isChecked 转换为 access options 
// defaultAccess
// 启用 1 禁用 2 NPC 购买3  拍卖行购买4

// const processSourcesTypes = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {
//     if (item.bluePrint && item.bluePrint.sources) {
//       // 将 sources 按照 types 归类处理

//       // 固定顺序，分别为 商人购买 其它
//       let sources = [null, null];

//       let access = item.access;

//       item.bluePrint.sources.forEach(_source => {

//         if (_source.type === 3) {
//           if (sources[0]) {
//             sources[0].push(_source);
//           } else {
//             sources[0] = [_source];
//           }
//         } else {
//           if (_source.type === 4 && !item.isDisabled && item.isChecked) {
//             access = 5;
//           }
//           if (sources[1]) {
//             sources[1].push(_source);
//           } else {
//             sources[1] = [_source];
//           }
//         }

//       });

//       return {
//         ...item,
//         bluePrint: {
//           ...item.bluePrint,
//           sources
//         },
//         access,
//       };

//     } else {
//       return item;
//     }
//   }));

// };

// processSourcesTypes(8);

// 声望相关
// items 图纸 requires_faction { faction_id static 文件内 factions  reputation_id 3 中立 4 友善  5 尊敬 6 崇敬  7 崇拜  } 

// const processReputation = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {

//     const bluePrint = item.bluePrint;

//     if (item.bluePrint) {
//       // 从 items 中获取图纸信息
//       const _bp = itemsData.find(_it => _it.id === item.bluePrint.id);

//       if (_bp.requires_faction) {
//         const { faction_id, reputation_id } = _bp.requires_faction;

//         // console.log(_bp.name, staticData.factions.find(_fa => _fa.id === faction_id));

//         _bp.requires_faction.name = (staticData.factions.find(_fa => _fa.id === faction_id) || { name: undefined }).name;

//       }

//       return {
//         ...item,
//         access: _bp.requires_faction?.reputation_id > 4 ? 2 : item.access,
//         bluePrint: {
//           ...item.bluePrint,
//           requires_faction: _bp.requires_faction
//         }
//       }

//     }

//     return item;

//   }));

// };

// processReputation(8);

// TODO 添加是否拥有前序材料制作项标志位，前序材料id
// const processReputation = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {

//     let preProducedMaterial = [];

//     if (item.reagents) {
//       item.reagents.forEach(_reagent => {
//         let targetItem = _data.find(_it => _it.creates?.id === _reagent.id);

//         if (targetItem) {
//           preProducedMaterial.push({
//             id: targetItem.id,
//             count: _reagent.count ||　1
//           })
//         }
//       });

//     }

//     return {
//       ...item,
//       preProducedMaterial: preProducedMaterial.length ? preProducedMaterial : undefined
//     };

//   }));

// };

// processReputation(8);