import { Injectable, Logger } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { v4 as uuidv4 } from 'uuid';
import { MCDMService } from '~/services/smartdata/mcdm.service';

@Injectable()
export class LLMService {
  protected logger = new Logger(LLMService.name);

  protected llm: AxiosInstance = axios.create({
    baseURL: process.env.LLM_URL,

    httpAgent: process.env.LLM_PROXY
      ? new SocksProxyAgent(process.env.LLM_PROXY)
      : undefined,

    httpsAgent: process.env.LLM_PROXY
      ? new SocksProxyAgent(process.env.LLM_PROXY)
      : undefined,
  });

  constructor(protected readonly mcdm: MCDMService) {}

  async train() {
    await this.deleteTrainData();

    const result = [];
    const entities = await this.mcdm.getEntities();
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.isCatalog == true) continue;

      const trainResult = await this.trainByEntityId(entity.id);
      result.push(trainResult);
    }
    return result;
  }

  async trainByEntityId(entityId: string) {
    const result = Object.create({ id: entityId });
    const entities = await this.mcdm.getEntity(entityId);
    if (!entities.length) return undefined;

    const ddl = await this.mcdm.getDDL(entityId);
    await this.trainByDDL(ddl);
    result.ddl = ddl;

    // const entity = entities[0];
    // const props = entity.props;
    // const sqlProp = props.find((p) => p.code == 'belongSQL');
    // const promptProp = props.find((p) => p.code == 'belongQuestion');
    // if (sqlProp && promptProp) {
    //   try {
    //     const sql = JSON.parse(sqlProp.jsonValue).sql;
    //     const prompt = JSON.parse(promptProp.jsonValue).question;
    //     await this.trainByPrompt(sql, prompt);
    //     result.sql = sql;
    //     result.prompt = prompt;
    //   } catch {}
    // }

    return result;
  }

  async trainByDDL(ddl: string) {
    return await this.llm({
      method: 'POST',
      url: `/train`,
      params: { id: uuidv4(), ddl, orgid: '1', projectid: '1' },
    }).then((r) => {
      return r.data;
    });
  }

  async trainByPrompt(sql: string, prompt: string) {
    return await this.llm({
      method: 'POST',
      url: `/train`,
      params: {
        id: uuidv4(),
        question: prompt,
        sql: sql,
        orgid: '1',
        projectid: '1',
      },
    }).then((r) => {
      return r.data;
    });
  }

  async deleteTrainData(types?: Array<'ddl' | 'sqlquestion' | 'doc'>) {
    const deftypes = ['ddl', 'sqlquestion'];
    return await this.llm({
      method: 'POST',
      url: `/cleartrain`,
      params: {
        orgid: '1',
        projectid: '1',
        types: JSON.stringify(types ?? deftypes),
      },
    }).then((r) => {
      return r.data;
    });
  }

  async translate(text: string) {
    return await this.llm({
      method: 'POST',
      url: '/translate',
      params: {
        id: uuidv4(),
        orgid: '1',
        word: text,
      },
    }).then((r) => {
      return r.data;
    });
  }
}
