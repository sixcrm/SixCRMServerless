import {DynamoProductSchedule} from "../DynamoProductSchedule";
import ProductSchedule from "../../../models/ProductSchedule";
import {DataMigration} from "../DataMigration";
import {logger} from '../../../log';
import {createProductScheduleService} from "../../../index";
import ProductScheduleService from "../../../ProductScheduleService";

const log = logger('ImportProductSchedulesFromDynamoMigration');

export class ImportProductSchedulesFromDynamoMigration extends DataMigration {

	async migrate(): Promise<void> {
		const dynamoProductSchedules: DynamoProductSchedule[] = DynamoProductSchedule.fromArray(await this.getAllFromDynamo('productschedule'));
		const productSchedulesToInsert: ProductSchedule[] = dynamoProductSchedules.map(p => p.toProductSchedule()).filter(p => p.account_id !== '*');

		log.info(`Found ${productSchedulesToInsert.length} productSchedules in DynamoDB.`);

		for (const productSchedule of productSchedulesToInsert) {
			const productScheduleService: ProductScheduleService = await createProductScheduleService({accountId: productSchedule.account_id, ...this.auroraConfig});

			try {
				await productScheduleService.delete(productSchedule.id);
			} catch (e) {
				// failure to delete is not an exception
			}

			try {
				await this.saveOneToAurora(productSchedule);
				await productScheduleService.update(productSchedule);
			} catch (e) {
				log.warn(`Can't insert cycles for product schedule ${productSchedule.id}`);
			}
		}

		let insertedProductScheduleCount = 0;
		for (const productSchedule of productSchedulesToInsert) {
			insertedProductScheduleCount++;
			await this.getOneFromAurora(productSchedule.id).catch(e => {
				log.info(`ProductSchedule ${productSchedule.id} not found in Aurora.`);
				insertedProductScheduleCount--;
			});

		}

		log.info(`Inserted ${insertedProductScheduleCount}/${productSchedulesToInsert.length} product schedules to Aurora.`);
	}

	getModelClass() {
		return ProductSchedule;
	}

}

new ImportProductSchedulesFromDynamoMigration().execute();
