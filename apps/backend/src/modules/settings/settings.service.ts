import { AppDataSource } from '../../data-source';
import { Setting } from '../../entities/Setting';

export class SettingsService {
  private static repository = AppDataSource.getRepository(Setting);

  static async getSettings() {
    let settings = await this.repository.findOne({ where: { id: 1 } });
    
    if (!settings) {
      settings = this.repository.create({ id: 1 });
      await this.repository.save(settings);
    }
    
    return settings;
  }

  static async updateSettings(data: Partial<Setting>) {
    let settings = await this.repository.findOne({ where: { id: 1 } });
    
    if (!settings) {
      settings = this.repository.create({ id: 1, ...data });
    } else {
      Object.assign(settings, data);
    }
    
    return await this.repository.save(settings);
  }
}
