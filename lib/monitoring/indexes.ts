import { getDatabase } from '../mongodb';

interface IndexReport {
  indexCount: number;
  indexes: string[];
  documentCount: number;
  avgDocSize: number;
  storageSize: number;
}

interface QueryPerformanceResult {
  executionTime: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: string;
}

export async function checkIndexes(): Promise<Record<string, IndexReport>> {
  const db = await getDatabase();
  const collections = ['pages', 'projects', 'team', 'services', 'users'];
  
  const report: Record<string, IndexReport> = {};

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    const stats = await collection.stats();
    
    report[collectionName] = {
      indexCount: indexes.length,
      indexes: indexes.map((i: { name: string }) => i.name),
      documentCount: stats.count,
      avgDocSize: stats.avgObjSize,
      storageSize: stats.storageSize,
    };
  }

  return report;
}

export async function analyzeQueryPerformance(
  collectionName: string,
  query: Record<string, unknown>
): Promise<QueryPerformanceResult> {
  const db = await getDatabase();
  const collection = db.collection(collectionName);
  
  // Use explain to analyze query performance
  const explanation = await collection.find(query).explain('executionStats');
  
  return {
    executionTime: explanation.executionStats.executionTimeMillis,
    documentsExamined: explanation.executionStats.totalDocsExamined,
    documentsReturned: explanation.executionStats.nReturned,
    indexUsed: explanation.executionStats.executionStages?.indexName || 'collection scan',
  };
}
