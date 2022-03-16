export const codeTestOutput = `print('test')`;

export const codeTestEditorState = `print('test1')
print('test2')`;

export const codeTestDF = `import pandas as pd
cdf = cd.DataFrame(pd.read_csv('data/housing_data/data.csv'))`;

export const codeTestEditor = `import pandas as pd
cdf = cd.DataFrame(pd.read_csv('data/housing_data/data.csv'))
df = pd.DataFrame()
`;

export const codeTestMatplotBarPhase1 = `import matplotlib.pyplot as plt
labels = ['G1', 'G2', 'G3', 'G4', 'G5']
men_means = [20, 35, 30, 35, 27]
women_means = [25, 32, 34, 20, 25]
men_std = [2, 3, 4, 1, 2]
women_std = [3, 5, 2, 3, 3]
width = 0.35`;
export const codeTestMatplotBarPhase2 = `
fig, ax = plt.subplots()
ax.bar(labels, men_means, width, yerr=men_std, label='Men')
ax.bar(labels, women_means, width, yerr=women_std, bottom=men_means,label='Women')
ax.set_ylabel('Scores')
ax.set_title('Scores by group and gender')
ax.legend()
plt.show()`;

export const codeTestPlotinAudioVideo = `from IPython.display import Audio
Audio('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', autoplay=True)
from IPython.display import Video
Video('https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4')`;
