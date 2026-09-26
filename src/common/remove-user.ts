import type * as persist from 'node-persist';
import { SavedToken } from './auth/coral.js';
import { Jwt } from '../util/jwt.js';
import { NintendoAccountSessionTokenJwtPayload } from '../api/na.js';
import createDebug from '../util/debug.js';
import { iterateLocalStorage } from '../util/storage.js';

const debug = createDebug('nxapi:users:remove');

interface AppSavedMonitorState {
    users: {id: string;}[];
    discord_presence: {source: {na_id?: string;};} | null;
}

/** Remove all locally stored credentials and cached data for a Nintendo Account. */
export async function removeUserData(storage: persist.LocalStorage, na_id: string) {
    const mapped_coral_token: string | undefined = await storage.getItem('NintendoAccountToken.' + na_id);
    const mapped_moon_token: string | undefined = await storage.getItem('NintendoAccountToken-pctl.' + na_id);
    const coral_tokens = new Set(mapped_coral_token ? [mapped_coral_token] : []);
    const moon_tokens = new Set(mapped_moon_token ? [mapped_moon_token] : []);
    let coral_saved_token: SavedToken | undefined;

    for await (const {key, value} of iterateLocalStorage(storage)) {
        if (key.startsWith('NsoToken.')) {
            const session_token = key.substring(9);
            if (isTokenForUser(session_token, na_id)) coral_tokens.add(session_token);
        }

        if (key.startsWith('MoonToken.')) {
            const session_token = key.substring(10);
            if (isTokenForUser(session_token, na_id)) moon_tokens.add(session_token);
        }
    }

    for (const session_token of coral_tokens) {
        coral_saved_token ??= await storage.getItem('NsoToken.' + session_token);
        debug('Removing data for coral session token');
        await removeSavedCoralTokenData(storage, session_token);
    }

    for (const session_token of moon_tokens) {
        debug('Removing data for moon session token');
        await storage.removeItem('MoonToken.' + session_token);
    }

    if (coral_saved_token) {
        for await (const {key} of iterateLocalStorage(storage)) {
            if (key.startsWith('WebServicePersistentData.' + coral_saved_token.nsoAccount.user.nsaId + '.')) {
                debug('Removing web service persisted data', key.substring(25));
                await storage.removeItem(key);
            }
        }
    }

    const selected: string | undefined = await storage.getItem('SelectedUser');
    await storage.removeItem('NintendoAccountToken.' + na_id);
    await storage.removeItem('NintendoAccountToken-pctl.' + na_id);

    if (selected === na_id) {
        await storage.removeItem('SelectedUser');
        await storage.removeItem('SessionToken');
    }

    const app_monitors: AppSavedMonitorState | undefined = await storage.getItem('AppMonitors');
    if (app_monitors) {
        app_monitors.users = app_monitors.users.filter(user => user.id !== na_id);
        if (app_monitors.discord_presence?.source.na_id === na_id) app_monitors.discord_presence = null;
        await storage.setItem('AppMonitors', app_monitors);
    }

    const users = new Set<string>(await storage.getItem('NintendoAccountIds') ?? []);
    users.delete(na_id);
    await storage.setItem('NintendoAccountIds', [...users]);

    return {coral_session_token: mapped_coral_token, moon_session_token: mapped_moon_token};
}

function isTokenForUser(session_token: string, na_id: string) {
    try {
        const [jwt] = Jwt.decode<NintendoAccountSessionTokenJwtPayload>(session_token);
        return jwt.payload.sub === na_id;
    } catch (error) {
        debug('Ignoring malformed cached session token', error);
        return false;
    }
}

export async function removeSavedCoralTokenData(storage: persist.LocalStorage, session_token: string) {
    await storage.removeItem('NsoToken.' + session_token);
    await storage.removeItem('IksmToken.' + session_token);
    await storage.removeItem('NookToken.' + session_token);
    await storage.removeItem('NookUsers.' + session_token);
    await storage.removeItem('BulletToken.' + session_token);

    for await (const {key, value} of iterateLocalStorage(storage)) {
        if (key.startsWith('NookAuthToken.' + session_token + '.')) await storage.removeItem(key);
        if (value === session_token) await storage.removeItem(key);
    }
}
