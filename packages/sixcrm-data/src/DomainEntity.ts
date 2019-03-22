export default abstract class DomainEntity {

	abstract validate(): boolean;

	public validated(): any {
		this.validate();
		return this;
	}

}
