import json
import matplotlib.pyplot as plt

# Assuming you have your JSON data in a string named 'benchmark_data'
# Replace the 'benchmark_data' string with the actual content of your JSON file
benchmark_data = """
{
  "1": {
    "generation": 6,
    "verification": 8
  },
  "101": {
    "generation": 346,
    "verification": 342
  },
  "201": {
    "generation": 843,
    "verification": 847
  },
  "301": {
    "generation": 1552,
    "verification": 1507
  },
  "401": {
    "generation": 2294,
    "verification": 2283
  },
  "501": {
    "generation": 3254,
    "verification": 3252
  },
  "601": {
    "generation": 7100,
    "verification": 7322
  },
  "701": {
    "generation": 9470,
    "verification": 6705
  },
  "801": {
    "generation": 7126,
    "verification": 7656
  },
  "901": {
    "generation": 14642,
    "verification": 12967
  },
  "1001": {
    "generation": 10953,
    "verification": 17763
  },
  "1101": {
    "generation": 15806,
    "verification": 14724
  },
  "1201": {
    "generation": 23149,
    "verification": 17251
  },
  "1301": {
    "generation": 24991,
    "verification": 20234
  },
  "1401": {
    "generation": 26829,
    "verification": 26723
  },
  "1501": {
    "generation": 25669,
    "verification": 32458
  },
  "1601": {
    "generation": 33479,
    "verification": 29391
  },
  "1701": {
    "generation": 37343,
    "verification": 37064
  },
  "1801": {
    "generation": 39739,
    "verification": 41364
  },
  "1901": {
    "generation": 44073,
    "verification": 44050
  }
}
"""

# Load the JSON data
data = json.loads(benchmark_data)

# Extracting ring sizes, generation times, and verification times
ring_sizes = [int(key) for key in data.keys()]
generation_times = [data[key]["generation"] / 1000 for key in data.keys()]
verification_times = [data[key]["verification"] / 1000 for key in data.keys()]

# Plotting
plt.figure(figsize=(10, 6))
plt.plot(ring_sizes, generation_times, label='Generation Time', marker='o')
plt.plot(ring_sizes, verification_times, label='Verification Time', marker='x')
plt.xlabel('Ring Size')
plt.ylabel('Computation time (s)')
plt.title('Correlation between Ring Size and Computation Time')
plt.legend()
plt.grid(True)
plt.show()
