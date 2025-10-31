import {createApp} from '@genkit-ai/next';
import {app} from 'firebase-admin';

import '@/ai/dev';

export const {GET, POST} = createApp();
