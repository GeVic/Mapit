# Map It

It is a web based application which gives news based on the locations marker. If no news available,
then rss feed is parsed and displayed on the marked locations.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites & Installing

- Google Maps Javascropt api key, you could get the same from [JavaScript API](https://cloud.google.com/maps-platform/?__utma=102347093.1877704850.1531516518.1531516570.1531516570.1&__utmb=102347093.0.10.1531516570&__utmc=102347093&__utmx=-&__utmz=102347093.1531516570.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)&__utmv=-&__utmk=191571242&_ga=2.208774162.1889896042.1531516518-1877704850.1531516518#get-started)
-  Install Flask(micro web framework).

   ```pip install flask```
- Set enviroment varialble "API_KEY" with the google maps api key.
  - On powershell,

    ```$env:API_KEY='maps api key'```
    
  - On bash,

    ```export API_kEY='maps api key'```
- Run application.py

  ```flask run```

## Limitations

The suggestions in the search bar is based on Indian states and cities. For any other country you can change the **IN.txt**
with you choice of country file from http://download.geonames.org/export/dump/

Pre-Knowledge
allCountries.zip: all countries, for the UK only the outwards codes, the UK total codes are in GB_full.csv.zip
GB_full.csv.zip the full codes for the UK, ca 1.7 mio rows
<iso countrycode>: country specific subset also included in allCountries.zip
This work is licensed under a Creative Commons Attribution 3.0 License.
This means you can use the dump as long as you give credit to geonames (a link on your website to www.geonames.org is ok)
see http://creativecommons.org/licenses/by/3.0/
UK (GB_full.csv.zip): Contains Royal Mail data Royal Mail copyright and database right 2017.
The Data is provided "as is" without warranty or any representation of accuracy, timeliness or completeness.

This readme describes the GeoNames Postal Code dataset.
The main GeoNames gazetteer data extract is here: http://download.geonames.org/export/dump/

The data format is tab-delimited text in utf8 encoding, with the following fields :

| Columns      | Types                      |
|-------------------|------------------------------------------------------|
country code      | iso country code, 2 characters 
postal code       | varchar(20)
place name        | varchar(180)
admin name1       | 1. order subdivision (state) varchar(100)
admin code1       | 1. order subdivision (state) varchar(20)
admin name2       | 2. order subdivision (county/province) varchar(100)
admin code2       | 2. order subdivision (county/province) varchar(20)
admin name3       | 3. order subdivision (community) varchar(100)
admin code3       | 3. order subdivision (community) varchar(20)
latitude          | estimated latitude (wgs84)
longitude         | estimated longitude (wgs84)
accuracy          | accuracy of lat/lng from 1=estimated to 6=centroid
