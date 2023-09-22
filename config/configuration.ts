import {readFileSync} from 'fs';
import {join} from 'path';
import * as yaml from 'js-yaml';

export default () => yaml.load(readFileSync(join(__dirname, 'config.yaml'), 'utf8')) as Record<string, any>;
