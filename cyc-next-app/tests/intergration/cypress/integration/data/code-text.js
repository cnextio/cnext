export const codeCheckConsole = `print('test')`;

export const codeTestEditorState = `print('test1')
print('test2')`;

export const codeTestDF = `import pandas as pd
df = cd.DataFrame('data/housing_data/data.csv')`;

export const codeTestEditor = `import pandas as pd
cdf = cd.DataFrame(pd.read_csv('data/housing_data/data.csv'))
df = pd.DataFrame()
`;

export const codeTestMatplotlibLine = `plt.plot([5,6], [7,8])`;

export const codeTestMatplotlibTheCoherenceOfTwoSignals = `import numpy as np
import matplotlib.pyplot as plt
# Fixing random state for reproducibility
np.random.seed(19680801)
dt = 0.01
t = np.arange(0, 30, dt)
nse1 = np.random.randn(len(t))
nse2 = np.random.randn(len(t))

# Two signals with a coherent part at 10Hz and a random part
s1 = np.sin(2 * np.pi * 10 * t) + nse1
s2 = np.sin(2 * np.pi * 10 * t) + nse2

fig, axs = plt.subplots(2, 1)
axs[0].plot(t, s1, t, s2)
axs[0].set_xlim(0, 2)
axs[0].set_xlabel('time')
axs[0].set_ylabel('s1 and s2')
axs[0].grid(True)

cxy, f = axs[1].cohere(s1, s2, 256, 1. / dt)
axs[1].set_ylabel('coherence')

fig.tight_layout()
`;

export const codeTestPlotly = `import plotly.express as px
fig = px.scatter(x=[0, 1, 2, 3, 4], y=[0, 1, 4, 9, 16])
fig.show()`;

export const codeTestAudio = `from IPython.display import Audio
Audio('/Users/vicknguyen/Desktop/PROJECTS/CYCAI/cyc-next/cyc-next-app/cypress/downloads/test_audio.mp3', autoplay=True)
`;

export const codeTestVideo = `from IPython.display import Video
Video('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')`;

export const codeTestSaveState = `print("test")
plt.plot([5,6], [7,8])`;
