function formatNumber(value: number) {
  if (value >= 1000) {
    return value.toFixed(1);
  } else if (value >= 100) {
    return value.toFixed(2);
  } else if (value >= 10) {
    return value.toFixed(2);
  } else if (value >= 1) {
    return value.toFixed(3);
  } else if (value >= 0.1) {
    return value.toFixed(4);
  } else if (value >= 0.01) {
    return value.toFixed(5);
  } else if (value >= 0.001) {
    return value.toFixed(6);
  } else if (value >= 0.0001) {
    return value.toFixed(7);
  } else if (value >= 0.00001) {
    return value.toFixed(8);
  } else if (value >= 0.000001) {
    return value.toFixed(9);
  } else {
    return value.toFixed(10);
  }
}

export default formatNumber;
