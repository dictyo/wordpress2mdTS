import {LOG} from './Logging';

/**
 * Please let all env variables start with a capital letter
 */
export class Env {
  OUT_PATH = '';
  IN_PATH = '';
  defaultsUsed = false;

  add<K extends keyof Env>(name: K, defaultValue = 'default-value') {
    if (!(name in this)) {
      throw Error('You try to add an unknown environment variable: ' + name);
    }

    let isDefault = false;
    const envVal = process.env[name];

    if (!envVal) {
      this[name] = defaultValue;
      isDefault = true;
      this.defaultsUsed = true;
    } else {
      this[name] = envVal!;
    }

    if (isDefault) {
      LOG.warn(`--- ENV (DEFAULT!) ${name}: ${this[name]}`);
    } else {
      LOG.info(`--- ENV ${name}: ${this[name]}`);
    }
  }

  /**
   * Initializes derived and profile-dependent variables
   */
  // init() {
  //   for (const key in this) {
  //     if (this.isValidEnvVar(key)) {  // for all Env-Vars among properties
  //
  //       if (!(this[key])) {  // Variable is not initialized
  //         throw new Error(
  //             `Env not been initialized properly. No value for '${key}'!`);
  //       }
  //     }
  //   }
  //
  //   if (this.PROFILE === 'tfm-prod') {
  //     this._MAIL_TO = splitTrimMailAdresses(this.MAIL_TO_PROD);
  //   } else {
  //     this._MAIL_TO = splitTrimMailAdresses(this.MAIL_TO_TEST);
  //   }
  //
  //   this.initialized = true;
  // }

  private isValidEnvVar(
      key: string) {  // Env-Vars should at least start with a capital letter
    return (key.match(/^[A-Z]+.*/) !== null) &&
        (this.hasOwnProperty(
            key));  // All not-derived env-vars start with capital letter;
  }
}
