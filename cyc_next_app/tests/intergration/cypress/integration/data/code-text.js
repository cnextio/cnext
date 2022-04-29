export const codeCheckConsole = `print('test')`;

export const codeTestDF = `import cnext_libs.cycdataframe as cd
df = cd.DataFrame('data/housing_data/data.csv')`;

export const codeTestMatplotlibLine = `import matplotlib.pyplot as plt
plt.plot([5,6], [7,8])`;

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
Audio('https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3', autoplay=False)
`;

export const codeTestVideo = `from IPython.display import Video
Video('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')`;

export const codeTestImageJPG = `from IPython import display
display.Image("https://farm2.staticflickr.com/1533/26541536141_41abe98db3_z_d.jpg")`;

export const codeTestImagePNG = `from IPython import display
display.Image("https://kgo.googleusercontent.com/profile_vrt_raw_bytes_1587515358_10512.png")`;

export const codeTestGroupLines = `import matplotlib.pyplot as plt
plt.plot([5,6], [7,8])\n\n\n
`
