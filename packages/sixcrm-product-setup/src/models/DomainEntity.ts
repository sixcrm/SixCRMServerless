export default abstract class DomainEntity {

	created_at: Date = new Date();
	updated_at: Date = new Date();

	abstract validate(): boolean;

	public validated(): any {
		this.validate();
		return this;
	}

}
