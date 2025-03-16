import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface FileError extends Error {
  code?: string;
}

@Injectable()
export class JsonStorageService {
  private readonly storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), 'storage');
    this.initStorage().catch((error) => {
      console.error('Failed to initialize storage:', error);
    });
  }

  private async initStorage(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error: unknown) {
      const fileError = error as FileError;
      console.error('Error creating storage directory:', fileError.message);
    }
  }

  async saveData<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(this.storagePath, `${filename}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      const fileError = error as FileError;
      throw new Error(
        `Failed to save data to ${filename}: ${fileError.message}`,
      );
    }
  }

  async loadData<T>(filename: string): Promise<T | null> {
    const filePath = path.join(this.storagePath, `${filename}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error: unknown) {
      const fileError = error as FileError;
      if (fileError.code === 'ENOENT') {
        return null;
      }
      throw new Error(
        `Failed to load data from ${filename}: ${fileError.message}`,
      );
    }
  }

  async appendData<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(this.storagePath, `${filename}.json`);
    try {
      let existingData: T[] = [];
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        existingData = JSON.parse(fileContent) as T[];
      } catch (error: unknown) {
        const fileError = error as FileError;
        if (fileError.code !== 'ENOENT') {
          throw error;
        }
      }

      if (!Array.isArray(existingData)) {
        existingData = [];
      }

      existingData.push(data);
      await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
    } catch (error: unknown) {
      const fileError = error as FileError;
      throw new Error(
        `Failed to append data to ${filename}: ${fileError.message}`,
      );
    }
  }
}
