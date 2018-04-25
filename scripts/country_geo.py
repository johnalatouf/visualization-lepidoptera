# this file loads the data into pandas DataFrame, filters, and prints the json

import pandas as pd
import sys
import json
import numpy as np


def read_file(path):
    # df = pd.read_csv(path)
    # return df
    df = pd.DataFrame()
    chunksize = 50000
    TextFileReader = pd.read_csv(path, chunksize=chunksize, low_memory=False)   # TODO - low_memory is deprecated
    df = pd.concat(TextFileReader, ignore_index=True)
    return df

def filter_by_date(df, year, month):
    df = df[df["year"] == year]
    # df = df[df["month"] == month]

    return df

# data header may be different for this, so input it
def filter_by_country(df, country_header, country):
    df = df[df[country_header] == country]
    return df

# now make the points good for drawing - decimallatitude	decimallongitude
def points_for_draw(df, key, col_to_keep ):
    final = df[col_to_keep]
    # endlist = {}
    # for row in final.iterrows():
    #     rowlist = []
    #     for r in row:
    #         rowlist.append(r)
    #     endlist.append(rowlist)
    # print endlist

    values = {}
    for c in col_to_keep:
        values[c] = 'n/a'
    # print values
    final = final.fillna(value=values)

    final = final.as_matrix()
    final = final.tolist()

    # make a dict of lists?
    # for f in final:
    #     endlist[f[0]] = f[1:]

    # make a dict of dicts? this is better for JS, but makes strings bigger
    # for f in final:
    #     endlist[f[0]] = {}
    #     for i, elem in enumerate(f[1:]):
    #         endlist[f[0]][col_to_keep[i+1]] = elem

    #for col in final:
    # values = {'A': 0, 'B': 1, 'C': 2, 'D': 3}


    endlist = []
    for f in final:
        enddict = {}
        for i, elem in enumerate(f):
            enddict[col_to_keep[i]] = elem
        endlist.append(enddict)

    return endlist




if __name__ == "__main__":
    year = int(sys.argv[1])
    month = int(sys.argv[2])
    country = sys.argv[3]
    path = sys.argv[4]
    # path = "../data/butterflies_total.csv"
    # print path

    df = read_file(path)
    df = filter_by_date(df, year, month)
    df = filter_by_country(df, "countrycode", country)
    dflist = points_for_draw(df,'gbifid', ['gbifid', 'family', 'genus', 'species',
                                  'eventdate', 'decimallatitude', 'decimallongitude', 'month'])

    print json.dumps(dflist)

    # output = str(json.dumps(dflist))
    # print output[435102:435200]


