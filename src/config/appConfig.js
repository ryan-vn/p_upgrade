// 配置化内容
import engineeringData from '../api/engineering.json';
import enchantingData from '../api/enchanting.json';
import alchemyData from '../api/alchemy.json';
import tailoringData from '../api/tailoring.json';
import leatherworkingData from '../api/leatherworking.json';
import blacksmithingData from '../api/blacksmithing.json';
import jewelcraftingData from '../api/jewelcrafting.json';
import inscriptionData from '../api/inscription.json';
import cookingData from '../api/cooking.json';

export const professionsTypeArr = ['工程学', '附魔', '炼金术', '裁缝', '制皮', '锻造', '珠宝加工', '铭文', '烹饪'];
export const professionsDataArr = [engineeringData, enchantingData, alchemyData, tailoringData, leatherworkingData, blacksmithingData, jewelcraftingData, inscriptionData, cookingData];

export const reputationMap = {
  3: '中立',
  4: '友善',
  5: '尊敬',
  6: '崇敬',
  7: '崇拜',
}; 