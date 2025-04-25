export const getDefaultTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const timezones = [
	{
		name: 'Pacific/Midway (GMT-11:00)',
		value: 'Pacific/Midway',
		fullName: '(GMT-11:00) Midway',
		utc: '-11:00'
	},
	{
		name: 'Pacific/Niue (GMT-11:00)',
		value: 'Pacific/Niue',
		fullName: '(GMT-11:00) Alofi',
		utc: '-11:00'
	},
	{
		name: 'Pacific/Pago_Pago (GMT-11:00)',
		value: 'Pacific/Pago_Pago',
		fullName: '(GMT-11:00) Pago Pago, Tāfuna, Ta`ū, Taulaga',
		utc: '-11:00'
	},
	{
		name: 'America/Adak (GMT-10:00)',
		value: 'America/Adak',
		fullName: '(GMT-10:00) Adak',
		utc: '-10:00'
	},
	{
		name: 'Pacific/Honolulu (GMT-10:00)',
		value: 'Pacific/Honolulu',
		fullName: '(GMT-10:00) Honolulu, East Honolulu, Pearl City, Hilo, Kailua',
		utc: '-10:00'
	},
	{
		name: 'Pacific/Rarotonga (GMT-10:00)',
		value: 'Pacific/Rarotonga',
		fullName: '(GMT-10:00) Avarua',
		utc: '-10:00'
	},
	{
		name: 'Pacific/Tahiti (GMT-10:00)',
		value: 'Pacific/Tahiti',
		fullName: '(GMT-10:00) Faaa, Papeete, Punaauia, Pirae, Mahina',
		utc: '-10:00'
	},
	{
		name: 'Pacific/Marquesas (GMT-09:30)',
		value: 'Pacific/Marquesas',
		fullName: '(GMT-09:30) Taiohae',
		utc: '-09:30'
	},
	{
		name: 'America/Anchorage (GMT-09:00)',
		value: 'America/Anchorage',
		fullName: '(GMT-09:00) Anchorage, Fairbanks, Eagle River, Badger, Knik-Fairview',
		utc: '-09:00'
	},
	{
		name: 'America/Juneau (GMT-09:00)',
		value: 'America/Juneau',
		fullName: '(GMT-09:00) Juneau',
		utc: '-09:00'
	},
	{
		name: 'America/Metlakatla (GMT-09:00)',
		value: 'America/Metlakatla',
		fullName: '(GMT-09:00) Metlakatla',
		utc: '-09:00'
	},
	{
		name: 'America/Nome (GMT-09:00)',
		value: 'America/Nome',
		fullName: '(GMT-09:00) Nome',
		utc: '-09:00'
	},
	{
		name: 'America/Sitka (GMT-09:00)',
		value: 'America/Sitka',
		fullName: '(GMT-09:00) Sitka, Ketchikan',
		utc: '-09:00'
	},
	{
		name: 'America/Yakutat (GMT-09:00)',
		value: 'America/Yakutat',
		fullName: '(GMT-09:00) Yakutat',
		utc: '-09:00'
	},
	{
		name: 'Pacific/Gambier (GMT-09:00)',
		value: 'Pacific/Gambier',
		fullName: '(GMT-09:00) Gambier',
		utc: '-09:00'
	},
	{
		name: 'America/Los_Angeles (GMT-08:00)',
		value: 'America/Los_Angeles',
		fullName: '(GMT-08:00) Los Angeles, San Diego, San Jose, San Francisco, Seattle',
		utc: '-08:00'
	},
	{
		name: 'America/Tijuana (GMT-08:00)',
		value: 'America/Tijuana',
		fullName: '(GMT-08:00) Tijuana, Mexicali, Ensenada, Rosarito, Tecate',
		utc: '-08:00'
	},
	{
		name: 'America/Vancouver (GMT-08:00)',
		value: 'America/Vancouver',
		fullName: '(GMT-08:00) Vancouver, Surrey, Okanagan, Victoria, Burnaby',
		utc: '-08:00'
	},
	{
		name: 'Pacific/Pitcairn (GMT-08:00)',
		value: 'Pacific/Pitcairn',
		fullName: '(GMT-08:00) Adamstown',
		utc: '-08:00'
	},
	{
		name: 'America/Boise (GMT-07:00)',
		value: 'America/Boise',
		fullName: '(GMT-07:00) Boise, Meridian, Nampa, Idaho Falls, Pocatello',
		utc: '-07:00'
	},
	{
		name: 'America/Cambridge_Bay (GMT-07:00)',
		value: 'America/Cambridge_Bay',
		fullName: '(GMT-07:00) Cambridge Bay',
		utc: '-07:00'
	},
	{
		name: 'America/Chihuahua (GMT-07:00)',
		value: 'America/Chihuahua',
		fullName: '(GMT-07:00) Chihuahua, Ciudad Delicias, Cuauhtémoc, Parral, Nuevo Casas Grandes',
		utc: '-07:00'
	},
	{
		name: 'America/Creston (GMT-07:00)',
		value: 'America/Creston',
		fullName: '(GMT-07:00) Creston',
		utc: '-07:00'
	},
	{
		name: 'America/Dawson (GMT-07:00)',
		value: 'America/Dawson',
		fullName: '(GMT-07:00) Dawson',
		utc: '-07:00'
	},
	{
		name: 'America/Dawson_Creek (GMT-07:00)',
		value: 'America/Dawson_Creek',
		fullName: '(GMT-07:00) Fort St. John, Dawson Creek',
		utc: '-07:00'
	},
	{
		name: 'America/Denver (GMT-07:00)',
		value: 'America/Denver',
		fullName: '(GMT-07:00) Denver, El Paso, Albuquerque, Colorado Springs, Aurora',
		utc: '-07:00'
	},
	{
		name: 'America/Edmonton (GMT-07:00)',
		value: 'America/Edmonton',
		fullName: '(GMT-07:00) Calgary, Edmonton, Fort McMurray, Red Deer, Lethbridge',
		utc: '-07:00'
	},
	{
		name: 'America/Fort_Nelson (GMT-07:00)',
		value: 'America/Fort_Nelson',
		fullName: '(GMT-07:00) Fort Nelson',
		utc: '-07:00'
	},
	{
		name: 'America/Hermosillo (GMT-07:00)',
		value: 'America/Hermosillo',
		fullName: '(GMT-07:00) Hermosillo, Ciudad Obregón, Nogales, San Luis Río Colorado, Navojoa',
		utc: '-07:00'
	},
	{
		name: 'America/Inuvik (GMT-07:00)',
		value: 'America/Inuvik',
		fullName: '(GMT-07:00) Inuvik',
		utc: '-07:00'
	},
	{
		name: 'America/Mazatlan (GMT-07:00)',
		value: 'America/Mazatlan',
		fullName: '(GMT-07:00) Culiacán, Mazatlán, Tepic, Los Mochis, La Paz',
		utc: '-07:00'
	},
	{
		name: 'America/Ojinaga (GMT-07:00)',
		value: 'America/Ojinaga',
		fullName: '(GMT-07:00) Ciudad Juárez, Manuel Ojinaga, Ojinaga',
		utc: '-07:00'
	},
	{
		name: 'America/Phoenix (GMT-07:00)',
		value: 'America/Phoenix',
		fullName: '(GMT-07:00) Phoenix, Tucson, Mesa, Chandler, Gilbert',
		utc: '-07:00'
	},
	{
		name: 'America/Whitehorse (GMT-07:00)',
		value: 'America/Whitehorse',
		fullName: '(GMT-07:00) Whitehorse',
		utc: '-07:00'
	},
	{
		name: 'America/Yellowknife (GMT-07:00)',
		value: 'America/Yellowknife',
		fullName: '(GMT-07:00) Yellowknife',
		utc: '-07:00'
	},
	{
		name: 'America/Bahia_Banderas (GMT-06:00)',
		value: 'America/Bahia_Banderas',
		fullName: '(GMT-06:00) Mezcales, San Vicente, Bucerías, Valle de Banderas',
		utc: '-06:00'
	},
	{
		name: 'America/Belize (GMT-06:00)',
		value: 'America/Belize',
		fullName: '(GMT-06:00) Belize City, San Ignacio, Orange Walk, Belmopan, Dangriga',
		utc: '-06:00'
	},
	{
		name: 'America/Chicago (GMT-06:00)',
		value: 'America/Chicago',
		fullName: '(GMT-06:00) Chicago, Houston, San Antonio, Dallas, Austin',
		utc: '-06:00'
	},
	{
		name: 'America/Costa_Rica (GMT-06:00)',
		value: 'America/Costa_Rica',
		fullName: '(GMT-06:00) San José, Limón, San Francisco, Alajuela, Liberia',
		utc: '-06:00'
	},
	{
		name: 'America/El_Salvador (GMT-06:00)',
		value: 'America/El_Salvador',
		fullName: '(GMT-06:00) San Salvador, Soyapango, Santa Ana, San Miguel, Mejicanos',
		utc: '-06:00'
	},
	{
		name: 'America/Guatemala (GMT-06:00)',
		value: 'America/Guatemala',
		fullName: '(GMT-06:00) Guatemala City, Mixco, Villa Nueva, Petapa, San Juan Sacatepéquez',
		utc: '-06:00'
	},
	{
		name: 'America/Indiana/Knox (GMT-06:00)',
		value: 'America/Indiana/Knox',
		fullName: '(GMT-06:00) Knox',
		utc: '-06:00'
	},
	{
		name: 'America/Indiana/Tell_City (GMT-06:00)',
		value: 'America/Indiana/Tell_City',
		fullName: '(GMT-06:00) Tell City',
		utc: '-06:00'
	},
	{
		name: 'America/Managua (GMT-06:00)',
		value: 'America/Managua',
		fullName: '(GMT-06:00) Managua, León, Masaya, Chinandega, Matagalpa',
		utc: '-06:00'
	},
	{
		name: 'America/Matamoros (GMT-06:00)',
		value: 'America/Matamoros',
		fullName: '(GMT-06:00) Reynosa, Heroica Matamoros, Nuevo Laredo, Piedras Negras, Ciudad Acuña',
		utc: '-06:00'
	},
	{
		name: 'America/Menominee (GMT-06:00)',
		value: 'America/Menominee',
		fullName: '(GMT-06:00) Menominee, Iron Mountain, Kingsford, Ironwood, Iron River',
		utc: '-06:00'
	},
	{
		name: 'America/Merida (GMT-06:00)',
		value: 'America/Merida',
		fullName: '(GMT-06:00) Mérida, Campeche, Ciudad del Carmen, Kanasín, Valladolid',
		utc: '-06:00'
	},
	{
		name: 'America/Mexico_City (GMT-06:00)',
		value: 'America/Mexico_City',
		fullName: '(GMT-06:00) Mexico City, Iztapalapa, Ecatepec de Morelos, Guadalajara, Puebla',
		utc: '-06:00'
	},
	{
		name: 'America/Monterrey (GMT-06:00)',
		value: 'America/Monterrey',
		fullName: '(GMT-06:00) Monterrey, Saltillo, Guadalupe, Torreón, Victoria de Durango',
		utc: '-06:00'
	},
	{
		name: 'America/North_Dakota/Beulah (GMT-06:00)',
		value: 'America/North_Dakota/Beulah',
		fullName: '(GMT-06:00) Beulah',
		utc: '-06:00'
	},
	{
		name: 'America/North_Dakota/Center (GMT-06:00)',
		value: 'America/North_Dakota/Center',
		fullName: '(GMT-06:00) Center',
		utc: '-06:00'
	},
	{
		name: 'America/North_Dakota/New_Salem (GMT-06:00)',
		value: 'America/North_Dakota/New_Salem',
		fullName: '(GMT-06:00) Mandan',
		utc: '-06:00'
	},
	{
		name: 'America/Rainy_River (GMT-06:00)',
		value: 'America/Rainy_River',
		fullName: '(GMT-06:00) Rainy River',
		utc: '-06:00'
	},
	{
		name: 'America/Rankin_Inlet (GMT-06:00)',
		value: 'America/Rankin_Inlet',
		fullName: '(GMT-06:00) Rankin Inlet',
		utc: '-06:00'
	},
	{
		name: 'America/Regina (GMT-06:00)',
		value: 'America/Regina',
		fullName: '(GMT-06:00) Saskatoon, Regina, Prince Albert, Moose Jaw, North Battleford',
		utc: '-06:00'
	},
	{
		name: 'America/Resolute (GMT-06:00)',
		value: 'America/Resolute',
		fullName: '(GMT-06:00) Resolute',
		utc: '-06:00'
	},
	{
		name: 'America/Swift_Current (GMT-06:00)',
		value: 'America/Swift_Current',
		fullName: '(GMT-06:00) Swift Current',
		utc: '-06:00'
	},
	{
		name: 'America/Tegucigalpa (GMT-06:00)',
		value: 'America/Tegucigalpa',
		fullName: '(GMT-06:00) Tegucigalpa, San Pedro Sula, Choloma, La Ceiba, El Progreso',
		utc: '-06:00'
	},
	{
		name: 'America/Winnipeg (GMT-06:00)',
		value: 'America/Winnipeg',
		fullName: '(GMT-06:00) Winnipeg, Brandon, Kenora, Portage la Prairie, Thompson',
		utc: '-06:00'
	},
	{
		name: 'Pacific/Easter (GMT-06:00)',
		value: 'Pacific/Easter',
		fullName: '(GMT-06:00) Easter',
		utc: '-06:00'
	},
	{
		name: 'Pacific/Galapagos (GMT-06:00)',
		value: 'Pacific/Galapagos',
		fullName: '(GMT-06:00) Puerto Ayora, Puerto Baquerizo Moreno',
		utc: '-06:00'
	},
	{
		name: 'America/Atikokan (GMT-05:00)',
		value: 'America/Atikokan',
		fullName: '(GMT-05:00) Atikokan',
		utc: '-05:00'
	},
	{
		name: 'America/Bogota (GMT-05:00)',
		value: 'America/Bogota',
		fullName: '(GMT-05:00) Bogotá, Cali, Medellín, Barranquilla, Cartagena',
		utc: '-05:00'
	},
	{
		name: 'America/Cancun (GMT-05:00)',
		value: 'America/Cancun',
		fullName: '(GMT-05:00) Cancún, Chetumal, Playa del Carmen, Cozumel, Felipe Carrillo Puerto',
		utc: '-05:00'
	},
	{
		name: 'America/Cayman (GMT-05:00)',
		value: 'America/Cayman',
		fullName: '(GMT-05:00) George Town, West Bay, Bodden Town, East End, North Side',
		utc: '-05:00'
	},
	{
		name: 'America/Detroit (GMT-05:00)',
		value: 'America/Detroit',
		fullName: '(GMT-05:00) Detroit, Grand Rapids, Warren, Sterling Heights, Ann Arbor',
		utc: '-05:00'
	},
	{
		name: 'America/Eirunepe (GMT-05:00)',
		value: 'America/Eirunepe',
		fullName: '(GMT-05:00) Eirunepé, Benjamin Constant, Envira',
		utc: '-05:00'
	},
	{
		name: 'America/Grand_Turk (GMT-05:00)',
		value: 'America/Grand_Turk',
		fullName: '(GMT-05:00) Cockburn Town',
		utc: '-05:00'
	},
	{
		name: 'America/Guayaquil (GMT-05:00)',
		value: 'America/Guayaquil',
		fullName: '(GMT-05:00) Guayaquil, Quito, Cuenca, Santo Domingo de los Colorados, Machala',
		utc: '-05:00'
	},
	{
		name: 'America/Havana (GMT-05:00)',
		value: 'America/Havana',
		fullName: '(GMT-05:00) Havana, Santiago de Cuba, Camagüey, Holguín, Guantánamo',
		utc: '-05:00'
	},
	{
		name: 'America/Indiana/Indianapolis (GMT-05:00)',
		value: 'America/Indiana/Indianapolis',
		fullName: '(GMT-05:00) Indianapolis, Fort Wayne, South Bend, Carmel, Bloomington',
		utc: '-05:00'
	},
	{
		name: 'America/Indiana/Marengo (GMT-05:00)',
		value: 'America/Indiana/Marengo',
		fullName: '(GMT-05:00) Marengo',
		utc: '-05:00'
	},
	{
		name: 'America/Indiana/Petersburg (GMT-05:00)',
		value: 'America/Indiana/Petersburg',
		fullName: '(GMT-05:00) Petersburg',
		utc: '-05:00'
	},
	{
		name: 'America/Indiana/Vevay (GMT-05:00)',
		value: 'America/Indiana/Vevay',
		fullName: '(GMT-05:00) Vevay',
		utc: '-05:00'
	},
	{
		name: 'America/Indiana/Vincennes (GMT-05:00)',
		value: 'America/Indiana/Vincennes',
		fullName: '(GMT-05:00) Vincennes, Jasper, Washington, Huntingburg',
		utc: '-05:00'
	},
	{
		name: 'America/Indiana/Winamac (GMT-05:00)',
		value: 'America/Indiana/Winamac',
		fullName: '(GMT-05:00) Winamac',
		utc: '-05:00'
	},
	{
		name: 'America/Iqaluit (GMT-05:00)',
		value: 'America/Iqaluit',
		fullName: '(GMT-05:00) Iqaluit',
		utc: '-05:00'
	},
	{
		name: 'America/Jamaica (GMT-05:00)',
		value: 'America/Jamaica',
		fullName: '(GMT-05:00) Kingston, New Kingston, Spanish Town, Portmore, Montego Bay',
		utc: '-05:00'
	},
	{
		name: 'America/Kentucky/Louisville (GMT-05:00)',
		value: 'America/Kentucky/Louisville',
		fullName: '(GMT-05:00) Louisville, Jeffersonville, New Albany, Jeffersontown, Pleasure Ridge Park',
		utc: '-05:00'
	},
	{
		name: 'America/Kentucky/Monticello (GMT-05:00)',
		value: 'America/Kentucky/Monticello',
		fullName: '(GMT-05:00) Monticello',
		utc: '-05:00'
	},
	{
		name: 'America/Lima (GMT-05:00)',
		value: 'America/Lima',
		fullName: '(GMT-05:00) Lima, Arequipa, Callao, Trujillo, Chiclayo',
		utc: '-05:00'
	},
	{
		name: 'America/Nassau (GMT-05:00)',
		value: 'America/Nassau',
		fullName: '(GMT-05:00) Nassau, Lucaya, Freeport, West End, Cooper’s Town',
		utc: '-05:00'
	},
	{
		name: 'America/New_York (GMT-05:00)',
		value: 'America/New_York',
		fullName: '(GMT-05:00) New York City, Brooklyn, Queens, Philadelphia, Manhattan',
		utc: '-05:00'
	},
	{
		name: 'America/Nipigon (GMT-05:00)',
		value: 'America/Nipigon',
		fullName: '(GMT-05:00) Nipigon',
		utc: '-05:00'
	},
	{
		name: 'America/Panama (GMT-05:00)',
		value: 'America/Panama',
		fullName: '(GMT-05:00) Panamá, San Miguelito, Juan Díaz, David, Arraiján',
		utc: '-05:00'
	},
	{
		name: 'America/Pangnirtung (GMT-05:00)',
		value: 'America/Pangnirtung',
		fullName: '(GMT-05:00) Pangnirtung',
		utc: '-05:00'
	},
	{
		name: 'America/Port-au-Prince (GMT-05:00)',
		value: 'America/Port-au-Prince',
		fullName: '(GMT-05:00) Port-au-Prince, Carrefour, Delmas 73, Pétionville, Port-de-Paix',
		utc: '-05:00'
	},
	{
		name: 'America/Rio_Branco (GMT-05:00)',
		value: 'America/Rio_Branco',
		fullName: '(GMT-05:00) Rio Branco, Cruzeiro do Sul, Sena Madureira, Tarauacá, Feijó',
		utc: '-05:00'
	},
	{
		name: 'America/Thunder_Bay (GMT-05:00)',
		value: 'America/Thunder_Bay',
		fullName: '(GMT-05:00) Thunder Bay',
		utc: '-05:00'
	},
	{
		name: 'America/Toronto (GMT-05:00)',
		value: 'America/Toronto',
		fullName: '(GMT-05:00) Toronto, Montréal, Ottawa, Mississauga, Québec',
		utc: '-05:00'
	},
	{
		name: 'America/Anguilla (GMT-04:00)',
		value: 'America/Anguilla',
		fullName: '(GMT-04:00) The Valley, Blowing Point Village, Sandy Ground Village, The Quarter, Sandy Hill',
		utc: '-04:00'
	},
	{
		name: 'America/Antigua (GMT-04:00)',
		value: 'America/Antigua',
		fullName: '(GMT-04:00) Saint John’s, Piggotts, Bolands, Codrington, Parham',
		utc: '-04:00'
	},
	{
		name: 'America/Aruba (GMT-04:00)',
		value: 'America/Aruba',
		fullName: '(GMT-04:00) Oranjestad, Tanki Leendert, San Nicolas, Santa Cruz, Paradera',
		utc: '-04:00'
	},
	{
		name: 'America/Asuncion (GMT-04:00)',
		value: 'America/Asuncion',
		fullName: '(GMT-04:00) Asunción, Ciudad del Este, San Lorenzo, Capiatá, Lambaré',
		utc: '-04:00'
	},
	{
		name: 'America/Barbados (GMT-04:00)',
		value: 'America/Barbados',
		fullName: '(GMT-04:00) Bridgetown, Speightstown, Oistins, Bathsheba, Holetown',
		utc: '-04:00'
	},
	{
		name: 'America/Blanc-Sablon (GMT-04:00)',
		value: 'America/Blanc-Sablon',
		fullName: '(GMT-04:00) Lévis',
		utc: '-04:00'
	},
	{
		name: 'America/Boa_Vista (GMT-04:00)',
		value: 'America/Boa_Vista',
		fullName: '(GMT-04:00) Boa Vista',
		utc: '-04:00'
	},
	{
		name: 'America/Campo_Grande (GMT-04:00)',
		value: 'America/Campo_Grande',
		fullName: '(GMT-04:00) Campo Grande, Dourados, Corumbá, Três Lagoas, Ponta Porã',
		utc: '-04:00'
	},
	{
		name: 'America/Caracas (GMT-04:00)',
		value: 'America/Caracas',
		fullName: '(GMT-04:00) Caracas, Maracaibo, Maracay, Valencia, Barquisimeto',
		utc: '-04:00'
	},
	{
		name: 'America/Cuiaba (GMT-04:00)',
		value: 'America/Cuiaba',
		fullName: '(GMT-04:00) Cuiabá, Várzea Grande, Rondonópolis, Sinop, Barra do Garças',
		utc: '-04:00'
	},
	{
		name: 'America/Curacao (GMT-04:00)',
		value: 'America/Curacao',
		fullName: '(GMT-04:00) Willemstad, Sint Michiel Liber',
		utc: '-04:00'
	},
	{
		name: 'America/Dominica (GMT-04:00)',
		value: 'America/Dominica',
		fullName: '(GMT-04:00) Roseau, Portsmouth, Berekua, Saint Joseph, Wesley',
		utc: '-04:00'
	},
	{
		name: 'America/Glace_Bay (GMT-04:00)',
		value: 'America/Glace_Bay',
		fullName: '(GMT-04:00) Sydney, Glace Bay, Sydney Mines',
		utc: '-04:00'
	},
	{
		name: 'America/Goose_Bay (GMT-04:00)',
		value: 'America/Goose_Bay',
		fullName: '(GMT-04:00) Labrador City, Happy Valley-Goose Bay',
		utc: '-04:00'
	},
	{
		name: 'America/Grenada (GMT-04:00)',
		value: 'America/Grenada',
		fullName: '(GMT-04:00) Saint George\'s, Gouyave, Grenville, Victoria, Saint David’s',
		utc: '-04:00'
	},
	{
		name: 'America/Guadeloupe (GMT-04:00)',
		value: 'America/Guadeloupe',
		fullName: '(GMT-04:00) Les Abymes, Baie-Mahault, Le Gosier, Petit-Bourg, Sainte-Anne',
		utc: '-04:00'
	},
	{
		name: 'America/Guyana (GMT-04:00)',
		value: 'America/Guyana',
		fullName: '(GMT-04:00) Georgetown, Linden, New Amsterdam, Anna Regina, Bartica',
		utc: '-04:00'
	},
	{
		name: 'America/Halifax (GMT-04:00)',
		value: 'America/Halifax',
		fullName: '(GMT-04:00) Halifax, Dartmouth, Charlottetown, Lower Sackville, Truro',
		utc: '-04:00'
	},
	{
		name: 'America/Kralendijk (GMT-04:00)',
		value: 'America/Kralendijk',
		fullName: '(GMT-04:00) Kralendijk, Oranjestad, The Bottom',
		utc: '-04:00'
	},
	{
		name: 'America/La_Paz (GMT-04:00)',
		value: 'America/La_Paz',
		fullName: '(GMT-04:00) Santa Cruz de la Sierra, Cochabamba, La Paz, Sucre, Oruro',
		utc: '-04:00'
	},
	{
		name: 'America/Lower_Princes (GMT-04:00)',
		value: 'America/Lower_Princes',
		fullName: '(GMT-04:00) Cul de Sac, Lower Prince’s Quarter, Koolbaai, Philipsburg',
		utc: '-04:00'
	},
	{
		name: 'America/Manaus (GMT-04:00)',
		value: 'America/Manaus',
		fullName: '(GMT-04:00) Manaus, Itacoatiara, Parintins, Manacapuru, Coari',
		utc: '-04:00'
	},
	{
		name: 'America/Marigot (GMT-04:00)',
		value: 'America/Marigot',
		fullName: '(GMT-04:00) Marigot',
		utc: '-04:00'
	},
	{
		name: 'America/Martinique (GMT-04:00)',
		value: 'America/Martinique',
		fullName: '(GMT-04:00) Fort-de-France, Le Lamentin, Le Robert, Sainte-Marie, Le François',
		utc: '-04:00'
	},
	{
		name: 'America/Moncton (GMT-04:00)',
		value: 'America/Moncton',
		fullName: '(GMT-04:00) Moncton, Saint John, Fredericton, Dieppe, Miramichi',
		utc: '-04:00'
	},
	{
		name: 'America/Montserrat (GMT-04:00)',
		value: 'America/Montserrat',
		fullName: '(GMT-04:00) Brades, Saint Peters, Plymouth',
		utc: '-04:00'
	},
	{
		name: 'America/Porto_Velho (GMT-04:00)',
		value: 'America/Porto_Velho',
		fullName: '(GMT-04:00) Porto Velho, Ji Paraná, Vilhena, Ariquemes, Cacoal',
		utc: '-04:00'
	},
	{
		name: 'America/Port_of_Spain (GMT-04:00)',
		value: 'America/Port_of_Spain',
		fullName: '(GMT-04:00) Chaguanas, Mon Repos, San Fernando, Port of Spain, Rio Claro',
		utc: '-04:00'
	},
	{
		name: 'America/Puerto_Rico (GMT-04:00)',
		value: 'America/Puerto_Rico',
		fullName: '(GMT-04:00) San Juan, Bayamón, Carolina, Ponce, Caguas',
		utc: '-04:00'
	},
	{
		name: 'America/Santiago (GMT-04:00)',
		value: 'America/Santiago',
		fullName: '(GMT-04:00) Santiago, Puente Alto, Antofagasta, Viña del Mar, Valparaíso',
		utc: '-04:00'
	},
	{
		name: 'America/Santo_Domingo (GMT-04:00)',
		value: 'America/Santo_Domingo',
		fullName: '(GMT-04:00) Santo Domingo, Santiago de los Caballeros, Santo Domingo Oeste, Santo Domingo Este, San Pedro de Macorís',
		utc: '-04:00'
	},
	{
		name: 'America/St_Barthelemy (GMT-04:00)',
		value: 'America/St_Barthelemy',
		fullName: '(GMT-04:00) Gustavia',
		utc: '-04:00'
	},
	{
		name: 'America/St_Kitts (GMT-04:00)',
		value: 'America/St_Kitts',
		fullName: '(GMT-04:00) Basseterre, Fig Tree, Market Shop, Saint Paul’s, Middle Island',
		utc: '-04:00'
	},
	{
		name: 'America/St_Lucia (GMT-04:00)',
		value: 'America/St_Lucia',
		fullName: '(GMT-04:00) Castries, Bisee, Vieux Fort, Micoud, Soufrière',
		utc: '-04:00'
	},
	{
		name: 'America/St_Thomas (GMT-04:00)',
		value: 'America/St_Thomas',
		fullName: '(GMT-04:00) Saint Croix, Charlotte Amalie, Cruz Bay',
		utc: '-04:00'
	},
	{
		name: 'America/St_Vincent (GMT-04:00)',
		value: 'America/St_Vincent',
		fullName: '(GMT-04:00) Kingstown, Kingstown Park, Georgetown, Barrouallie, Port Elizabeth',
		utc: '-04:00'
	},
	{
		name: 'America/Thule (GMT-04:00)',
		value: 'America/Thule',
		fullName: '(GMT-04:00) Thule',
		utc: '-04:00'
	},
	{
		name: 'America/Tortola (GMT-04:00)',
		value: 'America/Tortola',
		fullName: '(GMT-04:00) Road Town',
		utc: '-04:00'
	},
	{
		name: 'Atlantic/Bermuda (GMT-04:00)',
		value: 'Atlantic/Bermuda',
		fullName: '(GMT-04:00) Hamilton',
		utc: '-04:00'
	},
	{
		name: 'America/St_Johns (GMT-03:30)',
		value: 'America/St_Johns',
		fullName: '(GMT-03:30) St. John\'s, Mount Pearl, Corner Brook, Conception Bay South, Bay Roberts',
		utc: '-03:30'
	},
	{
		name: 'America/Araguaina (GMT-03:00)',
		value: 'America/Araguaina',
		fullName: '(GMT-03:00) Palmas, Araguaína, Gurupi, Miracema do Tocantins, Porto Franco',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Buenos_Aires (GMT-03:00)',
		value: 'America/Argentina/Buenos_Aires',
		fullName: '(GMT-03:00) Buenos Aires, La Plata, Mar del Plata, Morón, Bahía Blanca',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Catamarca (GMT-03:00)',
		value: 'America/Argentina/Catamarca',
		fullName: '(GMT-03:00) San Fernando del Valle de Catamarca, Trelew, Puerto Madryn, Esquel, Rawson',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Cordoba (GMT-03:00)',
		value: 'America/Argentina/Cordoba',
		fullName: '(GMT-03:00) Córdoba, Rosario, Santa Fe, Resistencia, Santiago del Estero',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Jujuy (GMT-03:00)',
		value: 'America/Argentina/Jujuy',
		fullName: '(GMT-03:00) San Salvador de Jujuy, San Pedro de Jujuy, Libertador General San Martín, Palpalá, La Quiaca',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/La_Rioja (GMT-03:00)',
		value: 'America/Argentina/La_Rioja',
		fullName: '(GMT-03:00) La Rioja, Chilecito, Arauco, Chamical',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Mendoza (GMT-03:00)',
		value: 'America/Argentina/Mendoza',
		fullName: '(GMT-03:00) Mendoza, San Rafael, San Martín',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Rio_Gallegos (GMT-03:00)',
		value: 'America/Argentina/Rio_Gallegos',
		fullName: '(GMT-03:00) Comodoro Rivadavia, Río Gallegos, Caleta Olivia, Pico Truncado, Puerto Deseado',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Salta (GMT-03:00)',
		value: 'America/Argentina/Salta',
		fullName: '(GMT-03:00) Salta, Neuquén, Santa Rosa, San Carlos de Bariloche, Cipolletti',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/San_Juan (GMT-03:00)',
		value: 'America/Argentina/San_Juan',
		fullName: '(GMT-03:00) San Juan, Chimbas, Santa Lucía, Pocito, Caucete',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/San_Luis (GMT-03:00)',
		value: 'America/Argentina/San_Luis',
		fullName: '(GMT-03:00) San Luis, Villa Mercedes, La Punta, Merlo, Justo Daract',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Tucuman (GMT-03:00)',
		value: 'America/Argentina/Tucuman',
		fullName: '(GMT-03:00) San Miguel de Tucumán, Yerba Buena, Tafí Viejo, Alderetes, Aguilares',
		utc: '-03:00'
	},
	{
		name: 'America/Argentina/Ushuaia (GMT-03:00)',
		value: 'America/Argentina/Ushuaia',
		fullName: '(GMT-03:00) Ushuaia, Río Grande',
		utc: '-03:00'
	},
	{
		name: 'America/Bahia (GMT-03:00)',
		value: 'America/Bahia',
		fullName: '(GMT-03:00) Salvador, Feira de Santana, Vitória da Conquista, Itabuna, Camaçari',
		utc: '-03:00'
	},
	{
		name: 'America/Belem (GMT-03:00)',
		value: 'America/Belem',
		fullName: '(GMT-03:00) Belém, Ananindeua, Macapá, Parauapebas, Marabá',
		utc: '-03:00'
	},
	{
		name: 'America/Cayenne (GMT-03:00)',
		value: 'America/Cayenne',
		fullName: '(GMT-03:00) Cayenne, Matoury, Saint-Laurent-du-Maroni, Kourou, Rémire-Montjoly',
		utc: '-03:00'
	},
	{
		name: 'America/Fortaleza (GMT-03:00)',
		value: 'America/Fortaleza',
		fullName: '(GMT-03:00) Fortaleza, São Luís, Natal, Teresina, João Pessoa',
		utc: '-03:00'
	},
	{
		name: 'America/Godthab (GMT-03:00)',
		value: 'America/Godthab',
		fullName: '(GMT-03:00) Nuuk, Sisimiut, Ilulissat, Qaqortoq, Aasiaat',
		utc: '-03:00'
	},
	{
		name: 'America/Maceio (GMT-03:00)',
		value: 'America/Maceio',
		fullName: '(GMT-03:00) Maceió, Aracaju, Arapiraca, Nossa Senhora do Socorro, São Cristóvão',
		utc: '-03:00'
	},
	{
		name: 'America/Miquelon (GMT-03:00)',
		value: 'America/Miquelon',
		fullName: '(GMT-03:00) Saint-Pierre, Miquelon',
		utc: '-03:00'
	},
	{
		name: 'America/Montevideo (GMT-03:00)',
		value: 'America/Montevideo',
		fullName: '(GMT-03:00) Montevideo, Salto, Paysandú, Las Piedras, Rivera',
		utc: '-03:00'
	},
	{
		name: 'America/Paramaribo (GMT-03:00)',
		value: 'America/Paramaribo',
		fullName: '(GMT-03:00) Paramaribo, Lelydorp, Brokopondo, Nieuw Nickerie, Moengo',
		utc: '-03:00'
	},
	{
		name: 'America/Punta_Arenas (GMT-03:00)',
		value: 'America/Punta_Arenas',
		fullName: '(GMT-03:00) Punta Arenas, Puerto Natales',
		utc: '-03:00'
	},
	{
		name: 'America/Recife (GMT-03:00)',
		value: 'America/Recife',
		fullName: '(GMT-03:00) Recife, Jaboatão, Jaboatão dos Guararapes, Olinda, Paulista',
		utc: '-03:00'
	},
	{
		name: 'America/Santarem (GMT-03:00)',
		value: 'America/Santarem',
		fullName: '(GMT-03:00) Santarém, Altamira, Itaituba, Oriximiná, Alenquer',
		utc: '-03:00'
	},
	{
		name: 'America/Sao_Paulo (GMT-03:00)',
		value: 'America/Sao_Paulo',
		fullName: '(GMT-03:00) São Paulo, Rio de Janeiro, Belo Horizonte, Brasília, Curitiba',
		utc: '-03:00'
	},
	{
		name: 'Antarctica/Palmer (GMT-03:00)',
		value: 'Antarctica/Palmer',
		fullName: '(GMT-03:00) Palmer',
		utc: '-03:00'
	},
	{
		name: 'Antarctica/Rothera (GMT-03:00)',
		value: 'Antarctica/Rothera',
		fullName: '(GMT-03:00) Rothera',
		utc: '-03:00'
	},
	{
		name: 'Atlantic/Stanley (GMT-03:00)',
		value: 'Atlantic/Stanley',
		fullName: '(GMT-03:00) Stanley',
		utc: '-03:00'
	},
	{
		name: 'America/Noronha (GMT-02:00)',
		value: 'America/Noronha',
		fullName: '(GMT-02:00) Itamaracá',
		utc: '-02:00'
	},
	{
		name: 'Atlantic/South_Georgia (GMT-02:00)',
		value: 'Atlantic/South_Georgia',
		fullName: '(GMT-02:00) Grytviken',
		utc: '-02:00'
	},
	{
		name: 'America/Scoresbysund (GMT-01:00)',
		value: 'America/Scoresbysund',
		fullName: '(GMT-01:00) Scoresbysund',
		utc: '-01:00'
	},
	{
		name: 'Atlantic/Azores (GMT-01:00)',
		value: 'Atlantic/Azores',
		fullName: '(GMT-01:00) Ponta Delgada, Lagoa, Angra do Heroísmo, Rosto de Cão, Rabo de Peixe',
		utc: '-01:00'
	},
	{
		name: 'Atlantic/Cape_Verde (GMT-01:00)',
		value: 'Atlantic/Cape_Verde',
		fullName: '(GMT-01:00) Praia, Mindelo, Santa Maria, Cova Figueira, Santa Cruz',
		utc: '-01:00'
	},
	{
		name: 'Africa/Abidjan (GMT+00:00)',
		value: 'Africa/Abidjan',
		fullName: '(GMT+00:00) Abidjan, Abobo, Bouaké, Daloa, San-Pédro',
		utc: '+00:00'
	},
	{
		name: 'Africa/Accra (GMT+00:00)',
		value: 'Africa/Accra',
		fullName: '(GMT+00:00) Accra, Kumasi, Tamale, Takoradi, Atsiaman',
		utc: '+00:00'
	},
	{
		name: 'Africa/Bamako (GMT+00:00)',
		value: 'Africa/Bamako',
		fullName: '(GMT+00:00) Bamako, Sikasso, Mopti, Koutiala, Ségou',
		utc: '+00:00'
	},
	{
		name: 'Africa/Banjul (GMT+00:00)',
		value: 'Africa/Banjul',
		fullName: '(GMT+00:00) Serekunda, Brikama, Bakau, Banjul, Farafenni',
		utc: '+00:00'
	},
	{
		name: 'Africa/Bissau (GMT+00:00)',
		value: 'Africa/Bissau',
		fullName: '(GMT+00:00) Bissau, Bafatá, Gabú, Bissorã, Bolama',
		utc: '+00:00'
	},
	{
		name: 'Africa/Casablanca (GMT+00:00)',
		value: 'Africa/Casablanca',
		fullName: '(GMT+00:00) Casablanca, Rabat, Fès, Sale, Marrakesh',
		utc: '+00:00'
	},
	{
		name: 'Africa/Conakry (GMT+00:00)',
		value: 'Africa/Conakry',
		fullName: '(GMT+00:00) Camayenne, Conakry, Nzérékoré, Kindia, Kankan',
		utc: '+00:00'
	},
	{
		name: 'Africa/Dakar (GMT+00:00)',
		value: 'Africa/Dakar',
		fullName: '(GMT+00:00) Dakar, Pikine, Touba, Thiès, Thiès Nones',
		utc: '+00:00'
	},
	{
		name: 'Africa/El_Aaiun (GMT+00:00)',
		value: 'Africa/El_Aaiun',
		fullName: '(GMT+00:00) Laayoune, Dakhla, Laayoune Plage',
		utc: '+00:00'
	},
	{
		name: 'Africa/Freetown (GMT+00:00)',
		value: 'Africa/Freetown',
		fullName: '(GMT+00:00) Freetown, Bo, Kenema, Koidu, Makeni',
		utc: '+00:00'
	},
	{
		name: 'Africa/Lome (GMT+00:00)',
		value: 'Africa/Lome',
		fullName: '(GMT+00:00) Lomé, Sokodé, Kara, Atakpamé, Kpalimé',
		utc: '+00:00'
	},
	{
		name: 'Africa/Monrovia (GMT+00:00)',
		value: 'Africa/Monrovia',
		fullName: '(GMT+00:00) Monrovia, Gbarnga, Kakata, Bensonville, Harper',
		utc: '+00:00'
	},
	{
		name: 'Africa/Nouakchott (GMT+00:00)',
		value: 'Africa/Nouakchott',
		fullName: '(GMT+00:00) Nouakchott, Nouadhibou, Néma, Kaédi, Rosso',
		utc: '+00:00'
	},
	{
		name: 'Africa/Ouagadougou (GMT+00:00)',
		value: 'Africa/Ouagadougou',
		fullName: '(GMT+00:00) Ouagadougou, Bobo-Dioulasso, Koudougou, Ouahigouya, Banfora',
		utc: '+00:00'
	},
	{
		name: 'Africa/Sao_Tome (GMT+00:00)',
		value: 'Africa/Sao_Tome',
		fullName: '(GMT+00:00) São Tomé, Santo António',
		utc: '+00:00'
	},
	{
		name: 'America/Danmarkshavn (GMT+00:00)',
		value: 'America/Danmarkshavn',
		fullName: '(GMT+00:00) Danmarkshavn',
		utc: '+00:00'
	},
	{
		name: 'Antarctica/Troll (GMT+00:00)',
		value: 'Antarctica/Troll',
		fullName: '(GMT+00:00) Troll',
		utc: '+00:00'
	},
	{
		name: 'Atlantic/Canary (GMT+00:00)',
		value: 'Atlantic/Canary',
		fullName: '(GMT+00:00) Las Palmas de Gran Canaria, Santa Cruz de Tenerife, La Laguna, Telde, Arona',
		utc: '+00:00'
	},
	{
		name: 'Atlantic/Faroe (GMT+00:00)',
		value: 'Atlantic/Faroe',
		fullName: '(GMT+00:00) Tórshavn, Klaksvík, Fuglafjørður, Tvøroyri, Miðvágur',
		utc: '+00:00'
	},
	{
		name: 'Atlantic/Madeira (GMT+00:00)',
		value: 'Atlantic/Madeira',
		fullName: '(GMT+00:00) Funchal, Câmara de Lobos, São Martinho, Caniço, Machico',
		utc: '+00:00'
	},
	{
		name: 'Atlantic/Reykjavik (GMT+00:00)',
		value: 'Atlantic/Reykjavik',
		fullName: '(GMT+00:00) Reykjavík, Kópavogur, Hafnarfjörður, Akureyri, Garðabær',
		utc: '+00:00'
	},
	{
		name: 'Atlantic/St_Helena (GMT+00:00)',
		value: 'Atlantic/St_Helena',
		fullName: '(GMT+00:00) Jamestown, Georgetown, Edinburgh of the Seven Seas',
		utc: '+00:00'
	},
	{
		name: 'Europe/Dublin (GMT+00:00)',
		value: 'Europe/Dublin',
		fullName: '(GMT+00:00) Dublin, Cork, Luimneach, Gaillimh, Tallaght',
		utc: '+00:00'
	},
	{
		name: 'Europe/Guernsey (GMT+00:00)',
		value: 'Europe/Guernsey',
		fullName: '(GMT+00:00) Saint Peter Port, St Martin, Saint Sampson, St Anne, Saint Saviour',
		utc: '+00:00'
	},
	{
		name: 'Europe/Isle_of_Man (GMT+00:00)',
		value: 'Europe/Isle_of_Man',
		fullName: '(GMT+00:00) Douglas, Ramsey, Peel, Port Erin, Castletown',
		utc: '+00:00'
	},
	{
		name: 'Europe/Jersey (GMT+00:00)',
		value: 'Europe/Jersey',
		fullName: '(GMT+00:00) Saint Helier, Le Hocq',
		utc: '+00:00'
	},
	{
		name: 'Europe/Lisbon (GMT+00:00)',
		value: 'Europe/Lisbon',
		fullName: '(GMT+00:00) Lisbon, Porto, Amadora, Braga, Setúbal',
		utc: '+00:00'
	},
	{
		name: 'Europe/London (GMT+00:00)',
		value: 'Europe/London',
		fullName: '(GMT+00:00) London, Birmingham, Liverpool, Sheffield, Bristol',
		utc: '+00:00'
	},
	{
		name: 'Africa/Algiers (GMT+01:00)',
		value: 'Africa/Algiers',
		fullName: '(GMT+01:00) Algiers, Boumerdas, Oran, Tébessa, Constantine',
		utc: '+01:00'
	},
	{
		name: 'Africa/Bangui (GMT+01:00)',
		value: 'Africa/Bangui',
		fullName: '(GMT+01:00) Bangui, Bimbo, Mbaïki, Berbérati, Kaga Bandoro',
		utc: '+01:00'
	},
	{
		name: 'Africa/Brazzaville (GMT+01:00)',
		value: 'Africa/Brazzaville',
		fullName: '(GMT+01:00) Brazzaville, Pointe-Noire, Dolisie, Kayes, Owando',
		utc: '+01:00'
	},
	{
		name: 'Africa/Ceuta (GMT+01:00)',
		value: 'Africa/Ceuta',
		fullName: '(GMT+01:00) Ceuta, Melilla',
		utc: '+01:00'
	},
	{
		name: 'Africa/Douala (GMT+01:00)',
		value: 'Africa/Douala',
		fullName: '(GMT+01:00) Douala, Yaoundé, Garoua, Kousséri, Bamenda',
		utc: '+01:00'
	},
	{
		name: 'Africa/Kinshasa (GMT+01:00)',
		value: 'Africa/Kinshasa',
		fullName: '(GMT+01:00) Kinshasa, Masina, Kikwit, Mbandaka, Matadi',
		utc: '+01:00'
	},
	{
		name: 'Africa/Lagos (GMT+01:00)',
		value: 'Africa/Lagos',
		fullName: '(GMT+01:00) Lagos, Kano, Ibadan, Kaduna, Port Harcourt',
		utc: '+01:00'
	},
	{
		name: 'Africa/Libreville (GMT+01:00)',
		value: 'Africa/Libreville',
		fullName: '(GMT+01:00) Libreville, Port-Gentil, Franceville, Oyem, Moanda',
		utc: '+01:00'
	},
	{
		name: 'Africa/Luanda (GMT+01:00)',
		value: 'Africa/Luanda',
		fullName: '(GMT+01:00) Luanda, N’dalatando, Huambo, Lobito, Benguela',
		utc: '+01:00'
	},
	{
		name: 'Africa/Malabo (GMT+01:00)',
		value: 'Africa/Malabo',
		fullName: '(GMT+01:00) Bata, Malabo, Ebebiyin, Aconibe, Añisoc',
		utc: '+01:00'
	},
	{
		name: 'Africa/Ndjamena (GMT+01:00)',
		value: 'Africa/Ndjamena',
		fullName: '(GMT+01:00) N\'Djamena, Moundou, Sarh, Abéché, Kelo',
		utc: '+01:00'
	},
	{
		name: 'Africa/Niamey (GMT+01:00)',
		value: 'Africa/Niamey',
		fullName: '(GMT+01:00) Niamey, Zinder, Maradi, Agadez, Alaghsas',
		utc: '+01:00'
	},
	{
		name: 'Africa/Porto-Novo (GMT+01:00)',
		value: 'Africa/Porto-Novo',
		fullName: '(GMT+01:00) Cotonou, Abomey-Calavi, Djougou, Porto-Novo, Parakou',
		utc: '+01:00'
	},
	{
		name: 'Africa/Tunis (GMT+01:00)',
		value: 'Africa/Tunis',
		fullName: '(GMT+01:00) Tunis, Sfax, Sousse, Kairouan, Bizerte',
		utc: '+01:00'
	},
	{
		name: 'Africa/Windhoek (GMT+01:00)',
		value: 'Africa/Windhoek',
		fullName: '(GMT+01:00) Windhoek, Rundu, Walvis Bay, Oshakati, Swakopmund',
		utc: '+01:00'
	},
	{
		name: 'Arctic/Longyearbyen (GMT+01:00)',
		value: 'Arctic/Longyearbyen',
		fullName: '(GMT+01:00) Longyearbyen, Olonkinbyen',
		utc: '+01:00'
	},
	{
		name: 'Europe/Amsterdam (GMT+01:00)',
		value: 'Europe/Amsterdam',
		fullName: '(GMT+01:00) Amsterdam, Rotterdam, The Hague, Utrecht, Eindhoven',
		utc: '+01:00'
	},
	{
		name: 'Europe/Andorra (GMT+01:00)',
		value: 'Europe/Andorra',
		fullName: '(GMT+01:00) Andorra la Vella, les Escaldes, Encamp, Sant Julià de Lòria, la Massana',
		utc: '+01:00'
	},
	{
		name: 'Europe/Belgrade (GMT+01:00)',
		value: 'Europe/Belgrade',
		fullName: '(GMT+01:00) Belgrade, Pristina, Niš, Novi Sad, Prizren',
		utc: '+01:00'
	},
	{
		name: 'Europe/Berlin (GMT+01:00)',
		value: 'Europe/Berlin',
		fullName: '(GMT+01:00) Berlin, Hamburg, Munich, Köln, Frankfurt am Main',
		utc: '+01:00'
	},
	{
		name: 'Europe/Bratislava (GMT+01:00)',
		value: 'Europe/Bratislava',
		fullName: '(GMT+01:00) Bratislava, Košice, Prešov, Nitra, Žilina',
		utc: '+01:00'
	},
	{
		name: 'Europe/Brussels (GMT+01:00)',
		value: 'Europe/Brussels',
		fullName: '(GMT+01:00) Brussels, Antwerpen, Gent, Charleroi, Liège',
		utc: '+01:00'
	},
	{
		name: 'Europe/Budapest (GMT+01:00)',
		value: 'Europe/Budapest',
		fullName: '(GMT+01:00) Budapest, Debrecen, Miskolc, Szeged, Pécs',
		utc: '+01:00'
	},
	{
		name: 'Europe/Copenhagen (GMT+01:00)',
		value: 'Europe/Copenhagen',
		fullName: '(GMT+01:00) Copenhagen, Århus, Odense, Aalborg, Frederiksberg',
		utc: '+01:00'
	},
	{
		name: 'Europe/Gibraltar (GMT+01:00)',
		value: 'Europe/Gibraltar',
		fullName: '(GMT+01:00) Gibraltar',
		utc: '+01:00'
	},
	{
		name: 'Europe/Ljubljana (GMT+01:00)',
		value: 'Europe/Ljubljana',
		fullName: '(GMT+01:00) Ljubljana, Maribor, Celje, Kranj, Velenje',
		utc: '+01:00'
	},
	{
		name: 'Europe/Luxembourg (GMT+01:00)',
		value: 'Europe/Luxembourg',
		fullName: '(GMT+01:00) Luxembourg, Esch-sur-Alzette, Dudelange, Schifflange, Bettembourg',
		utc: '+01:00'
	},
	{
		name: 'Europe/Madrid (GMT+01:00)',
		value: 'Europe/Madrid',
		fullName: '(GMT+01:00) Madrid, Barcelona, Valencia, Sevilla, Zaragoza',
		utc: '+01:00'
	},
	{
		name: 'Europe/Malta (GMT+01:00)',
		value: 'Europe/Malta',
		fullName: '(GMT+01:00) Birkirkara, Qormi, Mosta, Żabbar, San Pawl il-Baħar',
		utc: '+01:00'
	},
	{
		name: 'Europe/Monaco (GMT+01:00)',
		value: 'Europe/Monaco',
		fullName: '(GMT+01:00) Monaco, Monte-Carlo, La Condamine',
		utc: '+01:00'
	},
	{
		name: 'Europe/Oslo (GMT+01:00)',
		value: 'Europe/Oslo',
		fullName: '(GMT+01:00) Oslo, Bergen, Trondheim, Stavanger, Drammen',
		utc: '+01:00'
	},
	{
		name: 'Europe/Paris (GMT+01:00)',
		value: 'Europe/Paris',
		fullName: '(GMT+01:00) Paris, Marseille, Lyon, Toulouse, Nice',
		utc: '+01:00'
	},
	{
		name: 'Europe/Podgorica (GMT+01:00)',
		value: 'Europe/Podgorica',
		fullName: '(GMT+01:00) Podgorica, Nikšić, Herceg Novi, Pljevlja, Budva',
		utc: '+01:00'
	},
	{
		name: 'Europe/Prague (GMT+01:00)',
		value: 'Europe/Prague',
		fullName: '(GMT+01:00) Prague, Brno, Ostrava, Pilsen, Olomouc',
		utc: '+01:00'
	},
	{
		name: 'Europe/Rome (GMT+01:00)',
		value: 'Europe/Rome',
		fullName: '(GMT+01:00) Rome, Milan, Naples, Turin, Palermo',
		utc: '+01:00'
	},
	{
		name: 'Europe/San_Marino (GMT+01:00)',
		value: 'Europe/San_Marino',
		fullName: '(GMT+01:00) Serravalle, Borgo Maggiore, San Marino, Domagnano, Fiorentino',
		utc: '+01:00'
	},
	{
		name: 'Europe/Sarajevo (GMT+01:00)',
		value: 'Europe/Sarajevo',
		fullName: '(GMT+01:00) Sarajevo, Banja Luka, Zenica, Tuzla, Mostar',
		utc: '+01:00'
	},
	{
		name: 'Europe/Skopje (GMT+01:00)',
		value: 'Europe/Skopje',
		fullName: '(GMT+01:00) Skopje, Bitola, Kumanovo, Prilep, Tetovo',
		utc: '+01:00'
	},
	{
		name: 'Europe/Stockholm (GMT+01:00)',
		value: 'Europe/Stockholm',
		fullName: '(GMT+01:00) Stockholm, Göteborg, Malmö, Uppsala, Sollentuna',
		utc: '+01:00'
	},
	{
		name: 'Europe/Tirane (GMT+01:00)',
		value: 'Europe/Tirane',
		fullName: '(GMT+01:00) Tirana, Durrës, Elbasan, Vlorë, Shkodër',
		utc: '+01:00'
	},
	{
		name: 'Europe/Vaduz (GMT+01:00)',
		value: 'Europe/Vaduz',
		fullName: '(GMT+01:00) Schaan, Vaduz, Triesen, Balzers, Eschen',
		utc: '+01:00'
	},
	{
		name: 'Europe/Vatican (GMT+01:00)',
		value: 'Europe/Vatican',
		fullName: '(GMT+01:00) Vatican City',
		utc: '+01:00'
	},
	{
		name: 'Europe/Vienna (GMT+01:00)',
		value: 'Europe/Vienna',
		fullName: '(GMT+01:00) Vienna, Graz, Linz, Favoriten, Donaustadt',
		utc: '+01:00'
	},
	{
		name: 'Europe/Warsaw (GMT+01:00)',
		value: 'Europe/Warsaw',
		fullName: '(GMT+01:00) Warsaw, Łódź, Kraków, Wrocław, Poznań',
		utc: '+01:00'
	},
	{
		name: 'Europe/Zagreb (GMT+01:00)',
		value: 'Europe/Zagreb',
		fullName: '(GMT+01:00) Zagreb, Split, Rijeka, Osijek, Zadar',
		utc: '+01:00'
	},
	{
		name: 'Europe/Zurich (GMT+01:00)',
		value: 'Europe/Zurich',
		fullName: '(GMT+01:00) Zürich, Genève, Basel, Lausanne, Bern',
		utc: '+01:00'
	},
	{
		name: 'Africa/Blantyre (GMT+02:00)',
		value: 'Africa/Blantyre',
		fullName: '(GMT+02:00) Lilongwe, Blantyre, Mzuzu, Zomba, Kasungu',
		utc: '+02:00'
	},
	{
		name: 'Africa/Bujumbura (GMT+02:00)',
		value: 'Africa/Bujumbura',
		fullName: '(GMT+02:00) Bujumbura, Muyinga, Gitega, Ruyigi, Ngozi',
		utc: '+02:00'
	},
	{
		name: 'Africa/Cairo (GMT+02:00)',
		value: 'Africa/Cairo',
		fullName: '(GMT+02:00) Cairo, Alexandria, Giza, Port Said, Suez',
		utc: '+02:00'
	},
	{
		name: 'Africa/Gaborone (GMT+02:00)',
		value: 'Africa/Gaborone',
		fullName: '(GMT+02:00) Gaborone, Francistown, Molepolole, Selebi-Phikwe, Maun',
		utc: '+02:00'
	},
	{
		name: 'Africa/Harare (GMT+02:00)',
		value: 'Africa/Harare',
		fullName: '(GMT+02:00) Harare, Bulawayo, Chitungwiza, Mutare, Gweru',
		utc: '+02:00'
	},
	{
		name: 'Africa/Johannesburg (GMT+02:00)',
		value: 'Africa/Johannesburg',
		fullName: '(GMT+02:00) Cape Town, Durban, Johannesburg, Soweto, Pretoria',
		utc: '+02:00'
	},
	{
		name: 'Africa/Juba (GMT+02:00)',
		value: 'Africa/Juba',
		fullName: '(GMT+02:00) Juba, Winejok, Malakal, Wau, Kuacjok',
		utc: '+02:00'
	},
	{
		name: 'Africa/Khartoum (GMT+02:00)',
		value: 'Africa/Khartoum',
		fullName: '(GMT+02:00) Khartoum, Omdurman, Nyala, Port Sudan, Kassala',
		utc: '+02:00'
	},
	{
		name: 'Africa/Kigali (GMT+02:00)',
		value: 'Africa/Kigali',
		fullName: '(GMT+02:00) Kigali, Butare, Gitarama, Musanze, Gisenyi',
		utc: '+02:00'
	},
	{
		name: 'Africa/Lubumbashi (GMT+02:00)',
		value: 'Africa/Lubumbashi',
		fullName: '(GMT+02:00) Lubumbashi, Mbuji-Mayi, Kisangani, Kananga, Likasi',
		utc: '+02:00'
	},
	{
		name: 'Africa/Lusaka (GMT+02:00)',
		value: 'Africa/Lusaka',
		fullName: '(GMT+02:00) Lusaka, Kitwe, Ndola, Kabwe, Chingola',
		utc: '+02:00'
	},
	{
		name: 'Africa/Maputo (GMT+02:00)',
		value: 'Africa/Maputo',
		fullName: '(GMT+02:00) Maputo, Matola, Beira, Nampula, Chimoio',
		utc: '+02:00'
	},
	{
		name: 'Africa/Maseru (GMT+02:00)',
		value: 'Africa/Maseru',
		fullName: '(GMT+02:00) Maseru, Mafeteng, Leribe, Maputsoe, Mohale’s Hoek',
		utc: '+02:00'
	},
	{
		name: 'Africa/Mbabane (GMT+02:00)',
		value: 'Africa/Mbabane',
		fullName: '(GMT+02:00) Manzini, Mbabane, Big Bend, Malkerns, Nhlangano',
		utc: '+02:00'
	},
	{
		name: 'Africa/Tripoli (GMT+02:00)',
		value: 'Africa/Tripoli',
		fullName: '(GMT+02:00) Tripoli, Benghazi, Mişrātah, Tarhuna, Al Khums',
		utc: '+02:00'
	},
	{
		name: 'Asia/Amman (GMT+02:00)',
		value: 'Asia/Amman',
		fullName: '(GMT+02:00) Amman, Zarqa, Irbid, Russeifa, Wādī as Sīr',
		utc: '+02:00'
	},
	{
		name: 'Asia/Beirut (GMT+02:00)',
		value: 'Asia/Beirut',
		fullName: '(GMT+02:00) Beirut, Ra’s Bayrūt, Tripoli, Sidon, Tyre',
		utc: '+02:00'
	},
	{
		name: 'Asia/Damascus (GMT+02:00)',
		value: 'Asia/Damascus',
		fullName: '(GMT+02:00) Aleppo, Damascus, Homs, Ḩamāh, Latakia',
		utc: '+02:00'
	},
	{
		name: 'Asia/Famagusta (GMT+02:00)',
		value: 'Asia/Famagusta',
		fullName: '(GMT+02:00) Famagusta, Kyrenia, Protaras, Paralímni, Lápithos',
		utc: '+02:00'
	},
	{
		name: 'Asia/Gaza (GMT+02:00)',
		value: 'Asia/Gaza',
		fullName: '(GMT+02:00) Gaza, Khān Yūnis, Jabālyā, Rafaḩ, Dayr al Balaḩ',
		utc: '+02:00'
	},
	{
		name: 'Asia/Hebron (GMT+02:00)',
		value: 'Asia/Hebron',
		fullName: '(GMT+02:00) East Jerusalem, Hebron, Nablus, Battir, Ţūlkarm',
		utc: '+02:00'
	},
	{
		name: 'Asia/Jerusalem (GMT+02:00)',
		value: 'Asia/Jerusalem',
		fullName: '(GMT+02:00) Jerusalem, Tel Aviv, West Jerusalem, Haifa, Ashdod',
		utc: '+02:00'
	},
	{
		name: 'Asia/Nicosia (GMT+02:00)',
		value: 'Asia/Nicosia',
		fullName: '(GMT+02:00) Nicosia, Limassol, Larnaca, Stróvolos, Paphos',
		utc: '+02:00'
	},
	{
		name: 'Europe/Athens (GMT+02:00)',
		value: 'Europe/Athens',
		fullName: '(GMT+02:00) Athens, Thessaloníki, Pátra, Piraeus, Lárisa',
		utc: '+02:00'
	},
	{
		name: 'Europe/Bucharest (GMT+02:00)',
		value: 'Europe/Bucharest',
		fullName: '(GMT+02:00) Bucharest, Sector 3, Sector 6, Sector 2, Iaşi',
		utc: '+02:00'
	},
	{
		name: 'Europe/Chisinau (GMT+02:00)',
		value: 'Europe/Chisinau',
		fullName: '(GMT+02:00) Chisinau, Tiraspol, Bălţi, Bender, Rîbniţa',
		utc: '+02:00'
	},
	{
		name: 'Europe/Helsinki (GMT+02:00)',
		value: 'Europe/Helsinki',
		fullName: '(GMT+02:00) Helsinki, Espoo, Tampere, Vantaa, Turku',
		utc: '+02:00'
	},
	{
		name: 'Europe/Kaliningrad (GMT+02:00)',
		value: 'Europe/Kaliningrad',
		fullName: '(GMT+02:00) Kaliningrad, Chernyakhovsk, Sovetsk, Baltiysk, Gusev',
		utc: '+02:00'
	},
	{
		name: 'Europe/Kyiv (GMT+02:00)',
		value: 'Europe/Kyiv',
		fullName: '(GMT+02:00) Kyiv, Kharkiv, Donetsk, Odesa, Dnipro',
		utc: '+02:00'
	},
	{
		name: 'Europe/Mariehamn (GMT+02:00)',
		value: 'Europe/Mariehamn',
		fullName: '(GMT+02:00) Mariehamn',
		utc: '+02:00'
	},
	{
		name: 'Europe/Riga (GMT+02:00)',
		value: 'Europe/Riga',
		fullName: '(GMT+02:00) Riga, Daugavpils, Liepāja, Jelgava, Jūrmala',
		utc: '+02:00'
	},
	{
		name: 'Europe/Sofia (GMT+02:00)',
		value: 'Europe/Sofia',
		fullName: '(GMT+02:00) Sofia, Plovdiv, Varna, Burgas, Ruse',
		utc: '+02:00'
	},
	{
		name: 'Europe/Tallinn (GMT+02:00)',
		value: 'Europe/Tallinn',
		fullName: '(GMT+02:00) Tallinn, Tartu, Narva, Kohtla-Järve, Pärnu',
		utc: '+02:00'
	},
	{
		name: 'Europe/Uzhgorod (GMT+02:00)',
		value: 'Europe/Uzhgorod',
		fullName: '(GMT+02:00) Uzhgorod, Mukachevo, Khust, Berehove, Tyachiv',
		utc: '+02:00'
	},
	{
		name: 'Europe/Vilnius (GMT+02:00)',
		value: 'Europe/Vilnius',
		fullName: '(GMT+02:00) Vilnius, Kaunas, Klaipėda, Šiauliai, Panevėžys',
		utc: '+02:00'
	},
	{
		name: 'Europe/Zaporizhzhia (GMT+02:00)',
		value: 'Europe/Zaporizhzhia',
		fullName: '(GMT+02:00) Luhansk, Sevastopol, Sievierodonetsk, Alchevsk, Lysychansk',
		utc: '+02:00'
	},
	{
		name: 'Africa/Addis_Ababa (GMT+03:00)',
		value: 'Africa/Addis_Ababa',
		fullName: '(GMT+03:00) Addis Ababa, Dire Dawa, Mek\'ele, Nazrēt, Bahir Dar',
		utc: '+03:00'
	},
	{
		name: 'Africa/Asmara (GMT+03:00)',
		value: 'Africa/Asmara',
		fullName: '(GMT+03:00) Asmara, Keren, Massawa, Assab, Mendefera',
		utc: '+03:00'
	},
	{
		name: 'Africa/Dar_es_Salaam (GMT+03:00)',
		value: 'Africa/Dar_es_Salaam',
		fullName: '(GMT+03:00) Dar es Salaam, Mwanza, Zanzibar, Arusha, Mbeya',
		utc: '+03:00'
	},
	{
		name: 'Africa/Djibouti (GMT+03:00)',
		value: 'Africa/Djibouti',
		fullName: '(GMT+03:00) Djibouti, \'Ali Sabieh, Tadjourah, Obock, Dikhil',
		utc: '+03:00'
	},
	{
		name: 'Africa/Kampala (GMT+03:00)',
		value: 'Africa/Kampala',
		fullName: '(GMT+03:00) Kampala, Gulu, Lira, Mbarara, Jinja',
		utc: '+03:00'
	},
	{
		name: 'Africa/Mogadishu (GMT+03:00)',
		value: 'Africa/Mogadishu',
		fullName: '(GMT+03:00) Mogadishu, Hargeysa, Berbera, Kismayo, Marka',
		utc: '+03:00'
	},
	{
		name: 'Africa/Nairobi (GMT+03:00)',
		value: 'Africa/Nairobi',
		fullName: '(GMT+03:00) Nairobi, Mombasa, Nakuru, Eldoret, Kisumu',
		utc: '+03:00'
	},
	{
		name: 'Antarctica/Syowa (GMT+03:00)',
		value: 'Antarctica/Syowa',
		fullName: '(GMT+03:00) Syowa',
		utc: '+03:00'
	},
	{
		name: 'Asia/Aden (GMT+03:00)',
		value: 'Asia/Aden',
		fullName: '(GMT+03:00) Sanaa, Al Ḩudaydah, Taiz, Aden, Mukalla',
		utc: '+03:00'
	},
	{
		name: 'Asia/Baghdad (GMT+03:00)',
		value: 'Asia/Baghdad',
		fullName: '(GMT+03:00) Baghdad, Basrah, Al Mawşil al Jadīdah, Al Başrah al Qadīmah, Mosul',
		utc: '+03:00'
	},
	{
		name: 'Asia/Bahrain (GMT+03:00)',
		value: 'Asia/Bahrain',
		fullName: '(GMT+03:00) Manama, Al Muharraq, Ar Rifā‘, Dār Kulayb, Madīnat Ḩamad',
		utc: '+03:00'
	},
	{
		name: 'Asia/Kuwait (GMT+03:00)',
		value: 'Asia/Kuwait',
		fullName: '(GMT+03:00) Al Aḩmadī, Ḩawallī, As Sālimīyah, Şabāḩ as Sālim, Al Farwānīyah',
		utc: '+03:00'
	},
	{
		name: 'Asia/Qatar (GMT+03:00)',
		value: 'Asia/Qatar',
		fullName: '(GMT+03:00) Doha, Ar Rayyān, Umm Şalāl Muḩammad, Al Wakrah, Al Khawr',
		utc: '+03:00'
	},
	{
		name: 'Asia/Riyadh (GMT+03:00)',
		value: 'Asia/Riyadh',
		fullName: '(GMT+03:00) Riyadh, Jeddah, Mecca, Medina, Sulţānah',
		utc: '+03:00'
	},
	{
		name: 'Europe/Istanbul (GMT+03:00)',
		value: 'Europe/Istanbul',
		fullName: '(GMT+03:00) Istanbul, Ankara, İzmir, Bursa, Adana',
		utc: '+03:00'
	},
	{
		name: 'Europe/Kirov (GMT+03:00)',
		value: 'Europe/Kirov',
		fullName: '(GMT+03:00) Kirov, Kirovo-Chepetsk, Vyatskiye Polyany, Slobodskoy, Kotel’nich',
		utc: '+03:00'
	},
	{
		name: 'Europe/Minsk (GMT+03:00)',
		value: 'Europe/Minsk',
		fullName: '(GMT+03:00) Minsk, Homyel\', Mahilyow, Vitebsk, Hrodna',
		utc: '+03:00'
	},
	{
		name: 'Europe/Moscow (GMT+03:00)',
		value: 'Europe/Moscow',
		fullName: '(GMT+03:00) Moscow, Saint Petersburg, Nizhniy Novgorod, Kazan, Rostov-na-Donu',
		utc: '+03:00'
	},
	{
		name: 'Europe/Simferopol (GMT+03:00)',
		value: 'Europe/Simferopol',
		fullName: '(GMT+03:00) Simferopol, Kerch, Yevpatoriya, Yalta, Feodosiya',
		utc: '+03:00'
	},
	{
		name: 'Europe/Volgograd (GMT+03:00)',
		value: 'Europe/Volgograd',
		fullName: '(GMT+03:00) Volgograd, Volzhskiy, Kamyshin, Mikhaylovka, Uryupinsk',
		utc: '+03:00'
	},
	{
		name: 'Indian/Antananarivo (GMT+03:00)',
		value: 'Indian/Antananarivo',
		fullName: '(GMT+03:00) Antananarivo, Toamasina, Antsirabe, Fianarantsoa, Mahajanga',
		utc: '+03:00'
	},
	{
		name: 'Indian/Comoro (GMT+03:00)',
		value: 'Indian/Comoro',
		fullName: '(GMT+03:00) Moroni, Moutsamoudou, Fomboni, Domoni, Tsimbeo',
		utc: '+03:00'
	},
	{
		name: 'Indian/Mayotte (GMT+03:00)',
		value: 'Indian/Mayotte',
		fullName: '(GMT+03:00) Mamoudzou, Koungou, Dzaoudzi, Dembeni, Sada',
		utc: '+03:00'
	},
	{
		name: 'Asia/Tehran (GMT+03:30)',
		value: 'Asia/Tehran',
		fullName: '(GMT+03:30) Tehran, Mashhad, Isfahan, Karaj, Tabriz',
		utc: '+03:30'
	},
	{
		name: 'Asia/Baku (GMT+04:00)',
		value: 'Asia/Baku',
		fullName: '(GMT+04:00) Baku, Ganja, Sumqayıt, Lankaran, Yevlakh',
		utc: '+04:00'
	},
	{
		name: 'Asia/Dubai (GMT+04:00)',
		value: 'Asia/Dubai',
		fullName: '(GMT+04:00) Dubai, Sharjah, Abu Dhabi, Ajman City, Ras Al Khaimah City',
		utc: '+04:00'
	},
	{
		name: 'Asia/Muscat (GMT+04:00)',
		value: 'Asia/Muscat',
		fullName: '(GMT+04:00) Muscat, Seeb, Şalālah, Bawshar, Sohar',
		utc: '+04:00'
	},
	{
		name: 'Asia/Tbilisi (GMT+04:00)',
		value: 'Asia/Tbilisi',
		fullName: '(GMT+04:00) Tbilisi, Kutaisi, Batumi, Sokhumi, Zugdidi',
		utc: '+04:00'
	},
	{
		name: 'Asia/Yerevan (GMT+04:00)',
		value: 'Asia/Yerevan',
		fullName: '(GMT+04:00) Yerevan, Gyumri, Vanadzor, Vagharshapat, Hrazdan',
		utc: '+04:00'
	},
	{
		name: 'Europe/Astrakhan (GMT+04:00)',
		value: 'Europe/Astrakhan',
		fullName: '(GMT+04:00) Astrakhan, Akhtubinsk, ZfullNamensk, Kharabali, Kamyzyak',
		utc: '+04:00'
	},
	{
		name: 'Europe/Samara (GMT+04:00)',
		value: 'Europe/Samara',
		fullName: '(GMT+04:00) Samara, Togliatti-on-the-Volga, Izhevsk, Syzran’, Novokuybyshevsk',
		utc: '+04:00'
	},
	{
		name: 'Europe/Saratov (GMT+04:00)',
		value: 'Europe/Saratov',
		fullName: '(GMT+04:00) Saratov, Balakovo, Engel’s, Balashov, Vol’sk',
		utc: '+04:00'
	},
	{
		name: 'Europe/Ulyanovsk (GMT+04:00)',
		value: 'Europe/Ulyanovsk',
		fullName: '(GMT+04:00) Ulyanovsk, Dimitrovgrad, Inza, Barysh, Novoul’yanovsk',
		utc: '+04:00'
	},
	{
		name: 'Indian/Mahe (GMT+04:00)',
		value: 'Indian/Mahe',
		fullName: '(GMT+04:00) Victoria, Anse Boileau, Bel Ombre, Beau Vallon, Cascade',
		utc: '+04:00'
	},
	{
		name: 'Indian/Mauritius (GMT+04:00)',
		value: 'Indian/Mauritius',
		fullName: '(GMT+04:00) Port Louis, Beau Bassin-Rose Hill, Vacoas, Curepipe, Quatre Bornes',
		utc: '+04:00'
	},
	{
		name: 'Indian/Reunion (GMT+04:00)',
		value: 'Indian/Reunion',
		fullName: '(GMT+04:00) Saint-Denis, Saint-Paul, Saint-Pierre, Le Tampon, Saint-André',
		utc: '+04:00'
	},
	{
		name: 'Asia/Kabul (GMT+04:30)',
		value: 'Asia/Kabul',
		fullName: '(GMT+04:30) Kabul, Kandahār, Mazār-e Sharīf, Herāt, Jalālābād',
		utc: '+04:30'
	},
	{
		name: 'Antarctica/Mawson (GMT+05:00)',
		value: 'Antarctica/Mawson',
		fullName: '(GMT+05:00) Mawson',
		utc: '+05:00'
	},
	{
		name: 'Asia/Aqtau (GMT+05:00)',
		value: 'Asia/Aqtau',
		fullName: '(GMT+05:00) Shevchenko, Zhanaozen, Beyneu, Shetpe, Yeraliyev',
		utc: '+05:00'
	},
	{
		name: 'Asia/Aqtobe (GMT+05:00)',
		value: 'Asia/Aqtobe',
		fullName: '(GMT+05:00) Aktobe, Kandyagash, Shalqar, Khromtau, Embi',
		utc: '+05:00'
	},
	{
		name: 'Asia/Ashgabat (GMT+05:00)',
		value: 'Asia/Ashgabat',
		fullName: '(GMT+05:00) Ashgabat, Türkmenabat, Daşoguz, Mary, Balkanabat',
		utc: '+05:00'
	},
	{
		name: 'Asia/Atyrau (GMT+05:00)',
		value: 'Asia/Atyrau',
		fullName: '(GMT+05:00) Atyrau, Qulsary, Shalkar, Balykshi, Maqat',
		utc: '+05:00'
	},
	{
		name: 'Asia/Dushanbe (GMT+05:00)',
		value: 'Asia/Dushanbe',
		fullName: '(GMT+05:00) Dushanbe, Khujand, Kŭlob, Bokhtar, Istaravshan',
		utc: '+05:00'
	},
	{
		name: 'Asia/Karachi (GMT+05:00)',
		value: 'Asia/Karachi',
		fullName: '(GMT+05:00) Karachi, Lahore, Faisalabad, Rawalpindi, Multan',
		utc: '+05:00'
	},
	{
		name: 'Asia/Oral (GMT+05:00)',
		value: 'Asia/Oral',
		fullName: '(GMT+05:00) Oral, Aqsay, Zhänibek, Tasqala, Zhumysker',
		utc: '+05:00'
	},
	{
		name: 'Asia/Qyzylorda (GMT+05:00)',
		value: 'Asia/Qyzylorda',
		fullName: '(GMT+05:00) Kyzylorda, Baikonur, Novokazalinsk, Aral, Chiili',
		utc: '+05:00'
	},
	{
		name: 'Asia/Samarkand (GMT+05:00)',
		value: 'Asia/Samarkand',
		fullName: '(GMT+05:00) Samarkand, Bukhara, Nukus, Qarshi, Jizzax',
		utc: '+05:00'
	},
	{
		name: 'Asia/Tashkent (GMT+05:00)',
		value: 'Asia/Tashkent',
		fullName: '(GMT+05:00) Tashkent, Namangan, Andijon, Qo‘qon, Chirchiq',
		utc: '+05:00'
	},
	{
		name: 'Asia/Yekaterinburg (GMT+05:00)',
		value: 'Asia/Yekaterinburg',
		fullName: '(GMT+05:00) Yekaterinburg, Chelyabinsk, Ufa, Perm, Orenburg',
		utc: '+05:00'
	},
	{
		name: 'Indian/Kerguelen (GMT+05:00)',
		value: 'Indian/Kerguelen',
		fullName: '(GMT+05:00) Port-aux-Français',
		utc: '+05:00'
	},
	{
		name: 'Indian/Maldives (GMT+05:00)',
		value: 'Indian/Maldives',
		fullName: '(GMT+05:00) Male, Fuvahmulah, Hithadhoo, Kulhudhuffushi, Thinadhoo',
		utc: '+05:00'
	},
	{
		name: 'Asia/Colombo (GMT+05:30)',
		value: 'Asia/Colombo',
		fullName: '(GMT+05:30) Colombo, Dehiwala-Mount Lavinia, Moratuwa, Jaffna, Negombo',
		utc: '+05:30'
	},
	{
		name: 'Asia/Kolkata (GMT+05:30)',
		value: 'Asia/Kolkata',
		fullName: '(GMT+05:30) Mumbai, Delhi, Bengaluru, Kolkata, Chennai',
		utc: '+05:30'
	},
	{
		name: 'Asia/Kathmandu (GMT+05:45)',
		value: 'Asia/Kathmandu',
		fullName: '(GMT+05:45) Kathmandu, Pokhara, Pātan, Biratnagar, Birgañj',
		utc: '+05:45'
	},
	{
		name: 'Antarctica/Vostok (GMT+06:00)',
		value: 'Antarctica/Vostok',
		fullName: '(GMT+06:00) Vostok',
		utc: '+06:00'
	},
	{
		name: 'Asia/Almaty (GMT+05:00)',
		value: 'Asia/Almaty',
		fullName: '(GMT+05:00) Almaty, Karagandy, Shymkent, Taraz, Nur-Sultan',
		utc: '+05:00'
	},
	{
		name: 'Asia/Bishkek (GMT+06:00)',
		value: 'Asia/Bishkek',
		fullName: '(GMT+06:00) Bishkek, Osh, Jalal-Abad, Karakol, Tokmok',
		utc: '+06:00'
	},
	{
		name: 'Asia/Dhaka (GMT+06:00)',
		value: 'Asia/Dhaka',
		fullName: '(GMT+06:00) Dhaka, Chattogram, Khulna, Rājshāhi, Comilla',
		utc: '+06:00'
	},
	{
		name: 'Asia/Omsk (GMT+06:00)',
		value: 'Asia/Omsk',
		fullName: '(GMT+06:00) Omsk, Tara, Kalachinsk, ZfullNamenskoye, Tavricheskoye',
		utc: '+06:00'
	},
	{
		name: 'Asia/Qostanay (GMT+06:00)',
		value: 'Asia/Qostanay',
		fullName: '(GMT+06:00) Kostanay, Rudnyy, Dzhetygara, Arkalyk, Lisakovsk',
		utc: '+06:00'
	},
	{
		name: 'Asia/Thimphu (GMT+06:00)',
		value: 'Asia/Thimphu',
		fullName: '(GMT+06:00) himphu, Punākha, Tsirang, Phuntsholing, Pemagatshel',
		utc: '+06:00'
	},
	{
		name: 'Asia/Urumqi (GMT+06:00)',
		value: 'Asia/Urumqi',
		fullName: '(GMT+06:00) Zhongshan, Ürümqi, Zhanjiang, Shihezi, Huocheng',
		utc: '+06:00'
	},
	{
		name: 'Indian/Chagos (GMT+06:00)',
		value: 'Indian/Chagos',
		fullName: '(GMT+06:00) British Indian Ocean Territory',
		utc: '+06:00'
	},
	{
		name: 'Asia/Yangon (GMT+06:30)',
		value: 'Asia/Yangon',
		fullName: '(GMT+06:30) Yangon, Mandalay, Nay Pyi Taw, Mawlamyine, Kyain Seikgyi Township',
		utc: '+06:30'
	},
	{
		name: 'Indian/Cocos (GMT+06:30)',
		value: 'Indian/Cocos',
		fullName: '(GMT+06:30) West Island',
		utc: '+06:30'
	},
	{
		name: 'Antarctica/Davis (GMT+07:00)',
		value: 'Antarctica/Davis',
		fullName: '(GMT+07:00) Davis',
		utc: '+07:00'
	},
	{
		name: 'Asia/Bangkok (GMT+07:00)',
		value: 'Asia/Bangkok',
		fullName: '(GMT+07:00) Bangkok, Hanoi, Haiphong, Samut Prakan, Mueang Nonthaburi',
		utc: '+07:00'
	},
	{
		name: 'Asia/Barnaul (GMT+07:00)',
		value: 'Asia/Barnaul',
		fullName: '(GMT+07:00) Barnaul, Biysk, Rubtsovsk, Novoaltaysk, Gorno-Altaysk',
		utc: '+07:00'
	},
	{
		name: 'Asia/Hovd (GMT+07:00)',
		value: 'Asia/Hovd',
		fullName: '(GMT+07:00) Khovd, Ölgii, Ulaangom, Uliastay, Altai',
		utc: '+07:00'
	},
	{
		name: 'Asia/Ho_Chi_Minh (GMT+07:00)',
		value: 'Asia/Ho_Chi_Minh',
		fullName: '(GMT+07:00) Ho Chi Minh City, Da Nang, Biên Hòa, Nha Trang, Cần Thơ',
		utc: '+07:00'
	},
	{
		name: 'Asia/Jakarta (GMT+07:00)',
		value: 'Asia/Jakarta',
		fullName: '(GMT+07:00) Jakarta, Surabaya, Medan, Bandung, Bekasi',
		utc: '+07:00'
	},
	{
		name: 'Asia/Krasnoyarsk (GMT+07:00)',
		value: 'Asia/Krasnoyarsk',
		fullName: '(GMT+07:00) Krasnoyarsk, Abakan, Norilsk, Achinsk, Kyzyl',
		utc: '+07:00'
	},
	{
		name: 'Asia/Novokuznetsk (GMT+07:00)',
		value: 'Asia/Novokuznetsk',
		fullName: '(GMT+07:00) Novokuznetsk, Kemerovo, Prokop’yevsk, Leninsk-Kuznetsky, Kiselëvsk',
		utc: '+07:00'
	},
	{
		name: 'Asia/Novosibirsk (GMT+07:00)',
		value: 'Asia/Novosibirsk',
		fullName: '(GMT+07:00) Novosibirsk, Berdsk, Iskitim, Akademgorodok, Kuybyshev',
		utc: '+07:00'
	},
	{
		name: 'Asia/Phnom_Penh (GMT+07:00)',
		value: 'Asia/Phnom_Penh',
		fullName: '(GMT+07:00) Phnom Penh, Takeo, Sihanoukville, Battambang, Siem Reap',
		utc: '+07:00'
	},
	{
		name: 'Asia/Pontianak (GMT+07:00)',
		value: 'Asia/Pontianak',
		fullName: '(GMT+07:00) Pontianak, Tanjung Pinang, Palangkaraya, Singkawang, Sampit',
		utc: '+07:00'
	},
	{
		name: 'Asia/Tomsk (GMT+07:00)',
		value: 'Asia/Tomsk',
		fullName: '(GMT+07:00) Tomsk, Seversk, Strezhevoy, Kolpashevo, Asino',
		utc: '+07:00'
	},
	{
		name: 'Asia/Vientiane (GMT+07:00)',
		value: 'Asia/Vientiane',
		fullName: '(GMT+07:00) Vientiane, Pakse, Thakhèk, Savannakhet, Luang Prabang',
		utc: '+07:00'
	},
	{
		name: 'Indian/Christmas (GMT+07:00)',
		value: 'Indian/Christmas',
		fullName: '(GMT+07:00) Flying Fish Cove',
		utc: '+07:00'
	},
	{
		name: 'Asia/Brunei (GMT+08:00)',
		value: 'Asia/Brunei',
		fullName: '(GMT+08:00) Bandar Seri Begawan, Kuala Belait, Seria, Tutong, Bangar',
		utc: '+08:00'
	},
	{
		name: 'Asia/Choibalsan (GMT+08:00)',
		value: 'Asia/Choibalsan',
		fullName: '(GMT+08:00) Baruun-Urt, Choibalsan',
		utc: '+08:00'
	},
	{
		name: 'Asia/Hong_Kong (GMT+08:00)',
		value: 'Asia/Hong_Kong',
		fullName: '(GMT+08:00) Hong Kong, Kowloon, Tsuen Wan, Yuen Long Kau Hui, Tung Chung',
		utc: '+08:00'
	},
	{
		name: 'Asia/Irkutsk (GMT+08:00)',
		value: 'Asia/Irkutsk',
		fullName: '(GMT+08:00) Irkutsk, Ulan-Ude, Bratsk, Angarsk, Ust’-Ilimsk',
		utc: '+08:00'
	},
	{
		name: 'Asia/Kuala_Lumpur (GMT+08:00)',
		value: 'Asia/Kuala_Lumpur',
		fullName: '(GMT+08:00) Kota Bharu, Kuala Lumpur, Klang, Kampung Baru Subang, Johor Bahru',
		utc: '+08:00'
	},
	{
		name: 'Asia/Kuching (GMT+08:00)',
		value: 'Asia/Kuching',
		fullName: '(GMT+08:00) Kuching, Kota Kinabalu, Sandakan, Tawau, Miri',
		utc: '+08:00'
	},
	{
		name: 'Asia/Macau (GMT+08:00)',
		value: 'Asia/Macau',
		fullName: '(GMT+08:00) Macau',
		utc: '+08:00'
	},
	{
		name: 'Asia/Makassar (GMT+08:00)',
		value: 'Asia/Makassar',
		fullName: '(GMT+08:00) Makassar, Denpasar, City of Balikpapan, Banjarmasin, Manado',
		utc: '+08:00'
	},
	{
		name: 'Asia/Manila (GMT+08:00)',
		value: 'Asia/Manila',
		fullName: '(GMT+08:00) Quezon City, Manila, Caloocan City, Budta, Davao',
		utc: '+08:00'
	},
	{
		name: 'Asia/Shanghai (GMT+08:00)',
		value: 'Asia/Shanghai',
		fullName: '(GMT+08:00) Shanghai, Beijing, Tianjin, Guangzhou, Shenzhen',
		utc: '+08:00'
	},
	{
		name: 'Asia/Singapore (GMT+08:00)',
		value: 'Asia/Singapore',
		fullName: '(GMT+08:00) Singapore, Woodlands',
		utc: '+08:00'
	},
	{
		name: 'Asia/Taipei (GMT+08:00)',
		value: 'Asia/Taipei',
		fullName: '(GMT+08:00) Taipei, Kaohsiung, Taichung, Tainan, Banqiao',
		utc: '+08:00'
	},
	{
		name: 'Asia/Ulaanbaatar (GMT+08:00)',
		value: 'Asia/Ulaanbaatar',
		fullName: '(GMT+08:00) Ulan Bator, Erdenet, Darhan, Hovd, Mörön',
		utc: '+08:00'
	},
	{
		name: 'Australia/Perth (GMT+08:00)',
		value: 'Australia/Perth',
		fullName: '(GMT+08:00) Perth, Rockingham, Mandurah, Bunbury, Albany',
		utc: '+08:00'
	},
	{
		name: 'Australia/Eucla (GMT+08:45)',
		value: 'Australia/Eucla',
		fullName: '(GMT+08:45) Eucla',
		utc: '+08:45'
	},
	{
		name: 'Asia/Chita (GMT+09:00)',
		value: 'Asia/Chita',
		fullName: '(GMT+09:00) Chita, Krasnokamensk, Borzya, Petrovsk-Zabaykal’skiy, Aginskoye',
		utc: '+09:00'
	},
	{
		name: 'Asia/Dili (GMT+09:00)',
		value: 'Asia/Dili',
		fullName: '(GMT+09:00) Dili, Maliana, Suai, Likisá, Aileu',
		utc: '+09:00'
	},
	{
		name: 'Asia/Jayapura (GMT+09:00)',
		value: 'Asia/Jayapura',
		fullName: '(GMT+09:00) Ambon, Jayapura, Sorong, Ternate, Abepura',
		utc: '+09:00'
	},
	{
		name: 'Asia/Khandyga (GMT+09:00)',
		value: 'Asia/Khandyga',
		fullName: '(GMT+09:00) Khandyga',
		utc: '+09:00'
	},
	{
		name: 'Asia/Pyongyang (GMT+09:00)',
		value: 'Asia/Pyongyang',
		fullName: '(GMT+09:00) Pyongyang, Hamhŭng, Namp’o, Sunch’ŏn, Hŭngnam',
		utc: '+09:00'
	},
	{
		name: 'Asia/Seoul (GMT+09:00)',
		value: 'Asia/Seoul',
		fullName: '(GMT+09:00) Seoul, Busan, Incheon, Daegu, Daejeon',
		utc: '+09:00'
	},
	{
		name: 'Asia/Tokyo (GMT+09:00)',
		value: 'Asia/Tokyo',
		fullName: '(GMT+09:00) Tokyo, Yokohama, Osaka, Nagoya, Sapporo',
		utc: '+09:00'
	},
	{
		name: 'Asia/Yakutsk (GMT+09:00)',
		value: 'Asia/Yakutsk',
		fullName: '(GMT+09:00) Yakutsk, Blagoveshchensk, Belogorsk, Neryungri, Svobodnyy',
		utc: '+09:00'
	},
	{
		name: 'Pacific/Palau (GMT+09:00)',
		value: 'Pacific/Palau',
		fullName: '(GMT+09:00) Koror, Koror Town, Kloulklubed, Ulimang, Mengellang',
		utc: '+09:00'
	},
	{
		name: 'Australia/Adelaide (GMT+09:30)',
		value: 'Australia/Adelaide',
		fullName: '(GMT+09:30) Adelaide, Adelaide Hills, Mount Gambier, Morphett Vale, Gawler',
		utc: '+09:30'
	},
	{
		name: 'Australia/Broken_Hill (GMT+09:30)',
		value: 'Australia/Broken_Hill',
		fullName: '(GMT+09:30) Broken Hill',
		utc: '+09:30'
	},
	{
		name: 'Australia/Darwin (GMT+09:30)',
		value: 'Australia/Darwin',
		fullName: '(GMT+09:30) Darwin, Alice Springs, Palmerston, Howard Springs',
		utc: '+09:30'
	},
	{
		name: 'Antarctica/DumontDUrville (GMT+10:00)',
		value: 'Antarctica/DumontDUrville',
		fullName: '(GMT+10:00) DumontDUrville',
		utc: '+10:00'
	},
	{
		name: 'Antarctica/Macquarie (GMT+10:00)',
		value: 'Antarctica/Macquarie',
		fullName: '(GMT+10:00) Macquarie',
		utc: '+10:00'
	},
	{
		name: 'Asia/Ust-Nera (GMT+10:00)',
		value: 'Asia/Ust-Nera',
		fullName: '(GMT+10:00) Ust-Nera',
		utc: '+10:00'
	},
	{
		name: 'Asia/Vladivostok (GMT+10:00)',
		value: 'Asia/Vladivostok',
		fullName: '(GMT+10:00) Vladivostok, Khabarovsk, Khabarovsk Vtoroy, Komsomolsk-on-Amur, Ussuriysk',
		utc: '+10:00'
	},
	{
		name: 'Australia/Brisbane (GMT+10:00)',
		value: 'Australia/Brisbane',
		fullName: '(GMT+10:00) Brisbane, Gold Coast, Logan City, Townsville, Cairns',
		utc: '+10:00'
	},
	{
		name: 'Australia/Currie (GMT+10:00)',
		value: 'Australia/Currie',
		fullName: '(GMT+10:00) Currie',
		utc: '+10:00'
	},
	{
		name: 'Australia/Hobart (GMT+10:00)',
		value: 'Australia/Hobart',
		fullName: '(GMT+10:00) Hobart, Launceston, Burnie, Devonport, Sandy Bay',
		utc: '+10:00'
	},
	{
		name: 'Australia/Lindeman (GMT+10:00)',
		value: 'Australia/Lindeman',
		fullName: '(GMT+10:00) Lindeman',
		utc: '+10:00'
	},
	{
		name: 'Australia/Melbourne (GMT+10:00)',
		value: 'Australia/Melbourne',
		fullName: '(GMT+10:00) Melbourne, Geelong, Bendigo, Ballarat, Melbourne City Centre',
		utc: '+10:00'
	},
	{
		name: 'Australia/Sydney (GMT+10:00)',
		value: 'Australia/Sydney',
		fullName: '(GMT+10:00) Sydney, Canberra, Newcastle, Wollongong, Maitland',
		utc: '+10:00'
	},
	{
		name: 'Pacific/Chuuk (GMT+10:00)',
		value: 'Pacific/Chuuk',
		fullName: '(GMT+10:00) Weno, Colonia',
		utc: '+10:00'
	},
	{
		name: 'Pacific/Guam (GMT+10:00)',
		value: 'Pacific/Guam',
		fullName: '(GMT+10:00) Dededo Village, Yigo Village, Tamuning, Tamuning-Tumon-Harmon Village, Mangilao Village',
		utc: '+10:00'
	},
	{
		name: 'Pacific/Port_Moresby (GMT+10:00)',
		value: 'Pacific/Port_Moresby',
		fullName: '(GMT+10:00) Port Moresby, Lae, Mount Hagen, Popondetta, Madang',
		utc: '+10:00'
	},
	{
		name: 'Pacific/Saipan (GMT+10:00)',
		value: 'Pacific/Saipan',
		fullName: '(GMT+10:00) Saipan, San Jose Village',
		utc: '+10:00'
	},
	{
		name: 'Australia/Lord_Howe (GMT+10:30)',
		value: 'Australia/Lord_Howe',
		fullName: '(GMT+10:30) Lord Howe',
		utc: '+10:30'
	},
	{
		name: 'Antarctica/Casey (GMT+8:00)',
		value: 'Antarctica/Casey',
		fullName: '(GMT+8:00) Casey',
		utc: '+8:00'
	},
	{
		name: 'Asia/Magadan (GMT+11:00)',
		value: 'Asia/Magadan',
		fullName: '(GMT+11:00) Magadan, Ust-Nera, Susuman, Ola',
		utc: '+11:00'
	},
	{
		name: 'Asia/Sakhalin (GMT+11:00)',
		value: 'Asia/Sakhalin',
		fullName: '(GMT+11:00) Yuzhno-Sakhalinsk, Korsakov, Kholmsk, Okha, Nevel’sk',
		utc: '+11:00'
	},
	{
		name: 'Asia/Srednekolymsk (GMT+11:00)',
		value: 'Asia/Srednekolymsk',
		fullName: '(GMT+11:00) Srednekolymsk',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Bougainville (GMT+11:00)',
		value: 'Pacific/Bougainville',
		fullName: '(GMT+11:00) Arawa, Buka',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Efate (GMT+11:00)',
		value: 'Pacific/Efate',
		fullName: '(GMT+11:00) Port-Vila, Luganville, Isangel, Sola, Lakatoro',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Guadalcanal (GMT+11:00)',
		value: 'Pacific/Guadalcanal',
		fullName: '(GMT+11:00) Honiara, Malango, Auki, Gizo, Buala',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Kosrae (GMT+11:00)',
		value: 'Pacific/Kosrae',
		fullName: '(GMT+11:00) Tofol',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Norfolk (GMT+11:00)',
		value: 'Pacific/Norfolk',
		fullName: '(GMT+11:00) Kingston',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Noumea (GMT+11:00)',
		value: 'Pacific/Noumea',
		fullName: '(GMT+11:00) Nouméa, Mont-Dore, Dumbéa, Païta, Wé',
		utc: '+11:00'
	},
	{
		name: 'Pacific/Pohnpei (GMT+11:00)',
		value: 'Pacific/Pohnpei',
		fullName: '(GMT+11:00) Kolonia, Kolonia Town, Palikir - National Government Center',
		utc: '+11:00'
	},
	{
		name: 'Antarctica/McMurdo (GMT+12:00)',
		value: 'Antarctica/McMurdo',
		fullName: '(GMT+12:00) McMurdo',
		utc: '+12:00'
	},
	{
		name: 'Asia/Anadyr (GMT+12:00)',
		value: 'Asia/Anadyr',
		fullName: '(GMT+12:00) Anadyr, Bilibino',
		utc: '+12:00'
	},
	{
		name: 'Asia/Kamchatka (GMT+12:00)',
		value: 'Asia/Kamchatka',
		fullName: '(GMT+12:00) Petropavlovsk-Kamchatsky, Yelizovo, Vilyuchinsk, Klyuchi, Mil’kovo',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Auckland (GMT+12:00)',
		value: 'Pacific/Auckland',
		fullName: '(GMT+12:00) Auckland, Wellington, Christchurch, Manukau City, North Shore',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Fiji (GMT+12:00)',
		value: 'Pacific/Fiji',
		fullName: '(GMT+12:00) Suva, Lautoka, Nadi, Labasa, Ba',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Funafuti (GMT+12:00)',
		value: 'Pacific/Funafuti',
		fullName: '(GMT+12:00) Funafuti, Savave Village, Tanrake Village, Toga Village, Asau Village',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Kwajalein (GMT+12:00)',
		value: 'Pacific/Kwajalein',
		fullName: '(GMT+12:00) Ebaye, Jabat',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Majuro (GMT+12:00)',
		value: 'Pacific/Majuro',
		fullName: '(GMT+12:00) Majuro, Arno, Jabor, Wotje, Mili',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Nauru (GMT+12:00)',
		value: 'Pacific/Nauru',
		fullName: '(GMT+12:00) Yaren, Baiti, Anabar, Uaboe, Ijuw',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Tarawa (GMT+12:00)',
		value: 'Pacific/Tarawa',
		fullName: '(GMT+12:00) Tarawa, Betio Village, Bikenibeu Village',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Wake (GMT+12:00)',
		value: 'Pacific/Wake',
		fullName: '(GMT+12:00) Wake',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Wallis (GMT+12:00)',
		value: 'Pacific/Wallis',
		fullName: '(GMT+12:00) Mata-Utu, Leava, Alo',
		utc: '+12:00'
	},
	{
		name: 'Pacific/Chatham (GMT+12:45)',
		value: 'Pacific/Chatham',
		fullName: '(GMT+12:45) Waitangi',
		utc: '+12:45'
	},
	{
		name: 'Pacific/Apia (GMT+13:00)',
		value: 'Pacific/Apia',
		fullName: '(GMT+13:00) Apia, Asau, Mulifanua, Afega, Leulumoega',
		utc: '+13:00'
	},
	{
		name: 'Pacific/Enderbury (GMT+13:00)',
		value: 'Pacific/Enderbury',
		fullName: '(GMT+13:00) Enderbury',
		utc: '+13:00'
	},
	{
		name: 'Pacific/Fakaofo (GMT+13:00)',
		value: 'Pacific/Fakaofo',
		fullName: '(GMT+13:00) Atafu Village, Nukunonu, Fale old settlement',
		utc: '+13:00'
	},
	{
		name: 'Pacific/Tongatapu (GMT+13:00)',
		value: 'Pacific/Tongatapu',
		fullName: '(GMT+13:00) Nuku‘alofa, Lapaha, Neiafu, Pangai, ‘Ohonua',
		utc: '+13:00'
	},
	{
		name: 'Pacific/Kiritimati (GMT+14:00)',
		value: 'Pacific/Kiritimati',
		fullName: '(GMT+14:00) Kiritimati',
		utc: '+14:00'
	}
]
