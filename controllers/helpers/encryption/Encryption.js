

const _ = require('lodash');
const encryptionutilities = require('@6crm/sixcrmcore/util/encryption-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

class EncryptionHelper {
	constructor(entity_ref) {
		this.entity_ref = entity_ref;
	}

	encryptAttributes(paths, entity) {
		if (arrayutilities.nonEmpty(paths)) {
			arrayutilities.forEach(paths, attr_path => {
				if (objectutilities.hasRecursive(entity, attr_path)) {
					const attr_value = objectutilities.getRecursive(entity, attr_path);
					const encrypted_value = this.encrypt(entity, attr_value);

					objectutilities.setRecursive(entity, attr_path, encrypted_value);
				}
			});
		}

		return entity;
	}

	decryptAttributes(paths, entity) {
		if (arrayutilities.nonEmpty(paths)) {
			arrayutilities.forEach(paths, attr_path => {
				if (objectutilities.hasRecursive(entity, attr_path)) {
					const encrypted_value = objectutilities.getRecursive(entity, attr_path);
					const attr_value = this.decrypt(entity, encrypted_value);

					objectutilities.setRecursive(entity, attr_path, attr_value);
				}
			});
		}

		return entity;
	}

	censorEncryptedAttributes(paths, entity, custom_censor_fn) {
		if (_.isUndefined(custom_censor_fn) || !_.isFunction(custom_censor_fn)) {
			custom_censor_fn = () => '****';
		}

		if (arrayutilities.nonEmpty(paths)) {
			arrayutilities.forEach(paths, attr_path => {
				if (objectutilities.hasRecursive(entity, attr_path)) {
					const attr_value = objectutilities.getRecursive(entity, attr_path);
					const censored_attr = custom_censor_fn(attr_path, attr_value);

					objectutilities.setRecursive(entity, attr_path, censored_attr);
				}
			});
		}

		return entity;
	}

	encrypt(entity, value) {
		return encryptionutilities.encryptAES256(entity[this.entity_ref.primary_key], value)
	}

	decrypt(entity, value) {
		return encryptionutilities.decryptAES256(entity[this.entity_ref.primary_key], value)
	}
}

module.exports = EncryptionHelper;
