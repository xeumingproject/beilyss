export class USyncUser {
	id?: string
	lid?: string
	phone?: string
	username?: string
	usernameKey?: string
	type?: string
	personaId?: string
	pictureId?: string
	verifiedNameSerial?: string
	businessProfileTag?: string
	sidelistDelete?: boolean

	withId(id: string) {
		this.id = id
		return this
	}

	withLid(lid: string) {
		this.lid = lid
		return this
	}

	withPhone(phone: string) {
		this.phone = phone
		return this
	}

	withUsername(username: string) {
		this.username = username
		return this
	}

	withUsernameKey(usernameKey: string) {
		this.usernameKey = usernameKey
		return this
	}

	withType(type: string) {
		this.type = type
		return this
	}

	withPersonaId(personaId: string) {
		this.personaId = personaId
		return this
	}

	withPictureId(pictureId: string) {
		this.pictureId = pictureId
		return this
	}

	withVerifiedNameSerial(value: string) {
		this.verifiedNameSerial = value
		return this
	}

	withBusinessProfileTag(value: string) {
		this.businessProfileTag = value
		return this
	}

	withSidelistDelete(value = true) {
		this.sidelistDelete = value
		return this
	}
}
