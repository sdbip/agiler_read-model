var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pg from 'pg';
import { DATABASE_CONNECTION_STRING } from './config.js';
export class PGDatabase {
    item(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = new pg.Client(DATABASE_CONNECTION_STRING);
            yield db.connect();
            const rs = yield db.query('SELECT * FROM Items WHERE id = $1', [id]);
            const result = rs.rows;
            yield db.end();
            return result.map(r => {
                var _a;
                return ({
                    id: r.id,
                    type: r.type,
                    title: r.title,
                    progress: r.progress,
                    parentId: (_a = r.parent_id) !== null && _a !== void 0 ? _a : undefined,
                });
            })[0];
        });
    }
    itemsWithSpecification(specification) {
        return __awaiter(this, void 0, void 0, function* () {
            const clause = whereClause(specification);
            const query = clause ? `SELECT * FROM Items WHERE ${clause}` : 'SELECT * FROM Items';
            const db = new pg.Client(DATABASE_CONNECTION_STRING);
            yield db.connect();
            const rs = yield db.query(query, parameters(specification));
            const result = rs.rows;
            yield db.end();
            return result.map(r => {
                var _a;
                return ({
                    id: r.id,
                    type: r.type,
                    title: r.title,
                    progress: r.progress,
                    parentId: (_a = r.parent_id) !== null && _a !== void 0 ? _a : undefined,
                });
            });
        });
    }
}
function whereClause(specification) {
    const parameters = ['']; // Create a 1-based array by placing nonsense in position 0
    if (specification.progress)
        parameters.push('progress');
    if (specification.parent)
        parameters.push('parent');
    if (specification.type)
        parameters.push('type');
    const result = [];
    if (specification.progress)
        result.push(`progress = ANY($${parameters.indexOf('progress')}::TEXT[])`);
    if (specification.parent === null)
        result.push('parent_id IS NULL');
    if (specification.parent)
        result.push(`parent_id = $${parameters.indexOf('parent')}`);
    if (specification.type)
        result.push(`type = ANY($${parameters.indexOf('type')}::TEXT[])`);
    return result.join(' AND ');
}
function parameters(specification) {
    const progressIn = toArray(specification.progress);
    const typeIn = toArray(specification.type);
    return [progressIn, specification.parent, typeIn].filter(p => p);
}
function toArray(value) {
    return typeof value === 'string' ? [value] : value;
}
