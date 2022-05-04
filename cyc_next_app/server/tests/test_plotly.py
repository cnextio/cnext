import cnextlib.dataframe as cd
import plotly.express as px
import plotly.io as pio
import io
import sys
import os
os.chdir('/Volumes/GoogleDrive/.shortcut-targets-by-id/1FrvaCWSo3NV1g0sR9ib6frv_lzRww_8K/CycAI/works/CAT/machine_simulation/')
sys.path.append(os.getcwd())
training_data = cd.DataFrame('data/exp_data/997/21549286_out.csv')
df = training_data


def test_a_simple_line_graph():
    # pio.renderers.default = "json"
    fig = px.line(df, x=df.index, y='Fuel Rail Pressure', title="Machine")
    fig.show()


def px_original_test():
    # pio.renderers.default = "json"
    long_df = px.data.medals_long()
    fig = px.bar(long_df, x="nation", y="count",
                 color="medal", title="Long-Form Input")
    normal_stdout = sys.stdout
    sys.stdout = io.StringIO()
    fig.show()
    sys.stdout = normal_stdout


def test_histogram():
    # pio.renderers.default = "json"
    fig = eval("px.histogram(df, x='Fuel Rail Pressure')")
    print(type(fig))
    # fig.show()

# test_histogram()
