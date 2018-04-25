# this script bins the geo data into rectangles

import pandas as pd
import sys
import json
import numpy as np

pd.options.mode.chained_assignment = None  # clears up a false-positive warning with pandas

def read_file(path):
    # df = pd.read_csv(path)
    # return df
    df = pd.DataFrame()
    chunksize = 50000
    TextFileReader = pd.read_csv(path, chunksize=chunksize, low_memory=False)   # TODO - low_memory is deprecated
    df = pd.concat(TextFileReader, ignore_index=True)
    return df

def filter_by_date(df, year):
    df = df[df["year"] == year]
    # df = df[df["month"] == month]

    return df

# bin by month
def bin_by_month(df):

    for i in range(1,13):
        # make the map
        bin_map = [[0 for x in range(360)] for y in range(180)]
        # get the values
        monthdf = df[df['month'] == i]
        for index, row in monthdf.iterrows():
            lat = int(row['decimallatitude'])
            lon = int(row['decimallongitude'])
            bin_map[lon:lat] += 1
        print bin_map

# other type of binning
def bin_combine(df, lng, lat):
    df['coord'] = df.apply(lambda x: "%s,%s" % (x[lng], x[lat]), axis=1)
    return df

def binned_values(df, coord):
    df[coord] = df[coord].astype(str)
    values = df[coord].value_counts().astype(str).to_dict()
    # values = df[coord].value_counts().astype(np.int32).to_dict()
    return values

if __name__ == "__main__":
    year = int(sys.argv[2])
    path = sys.argv[1]
    # path = "../data/butterflies_total.csv"
    # year = 2017

    df = read_file(path)
    df = filter_by_date(df, year)

    final = df[['gbifid', 'family', 'genus', 'species','eventdate', 'decimallatitude', 'decimallongitude', 'month']]

    final.decimallatitude = final.decimallatitude.round()
    final.decimallongitude = final.decimallongitude.round()

    final = bin_combine(final, 'decimallongitude', 'decimallatitude')

    values = binned_values(final, 'coord')

    print json.dumps(values)