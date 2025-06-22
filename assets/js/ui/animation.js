export function animateHeaterLoads() {
  document.querySelectorAll('.load-circle').forEach(circle => {
    const unfilled = parseInt(
      circle.querySelector('.heater-percentage').textContent,
      10
    );

    circle.style.setProperty('--clip-path', 'inset(0 0 0 0)');
    requestAnimationFrame(() => {
      circle.style.setProperty(
        '--clip-path',
        `inset(0 0 ${unfilled}% 0)`
      );
    });
  });
  console.log('анимация прошла');
}