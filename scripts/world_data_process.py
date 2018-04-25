import pandas as pd


def make_country_precip(df):
    output = []
    for idx, r in df.iterrows():
        # print r.to_dict()
        country = {}
        country['name'] = r['Country Name']
        country['code'] = r['Country Code']
        country['year'] = '2014'
        country['P'] = r['2014 [YR2014]']
        output.append(country)
    return output


if __name__ == "__main__":
    path = "/Users/johnalatouf/Downloads/Data_Extract_From_World_Development_Indicators/0fd4a238-c6af-46ac-9169-943e9df494c7_Data.csv"
    df = pd.read_csv(path)
    df_2014 = df.drop(["2015 [YR2015]",	"2016 [YR2016]", "2017 [YR2017]"], axis=1)
    precip = make_country_precip(df_2014)
    print precip
