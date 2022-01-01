import GetUTC from "./GetUTC";

const Letters = "0123456789qwertyuiopasdfghjklzxcvbnm";
export function RandId() {
	let Out = "";
	for (let i = 0; i < 4; i++) {
		Out += Letters[~~(Math.random() * Letters.length)];
	}
	Out += "-";
	for (let i = 0; i < 4; i++) {
		Out += Letters[~~(Math.random() * Letters.length)];
	}
	return Out;
}

export default class Cache<T> {
	Cache: {
		[key: string]: {
			Value: T,
			CreatedAt: number
		}
	};

	private CacheSize: number;
	private CacheCount: number = 0;
	constructor(CacheSize: number) {
		this.CacheSize = CacheSize;
	}

	CacheAddItem(CacheItem: T) {
		let Id = RandId();
		this.Cache[Id] = {
			Value: CacheItem,
			CreatedAt: GetUTC()
		};
		this.CacheCount++;
		return Id;
	}

	PopCache() {
		let Lowest = Infinity;
		let LowestValue: string;
		for (const Key in this.Cache) {
			if (this.Cache[Key].CreatedAt < Lowest) {
				LowestValue = Key;
			}
		}
		if (LowestValue) {
			delete this.Cache[LowestValue];
		}
	}

	GetCacheItem(Id: string) {
		return this.Cache[Id] ? this.Cache[Id].Value : null;
	}
}