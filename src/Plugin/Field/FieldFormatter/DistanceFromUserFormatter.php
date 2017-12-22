<?php

//namespace Drupal\cpd_maps\Plugin\Field\FieldFormatter;
namespace Drupal\custom_field_formatter\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'distance_from_user' formatter.
 *
 * @FieldFormatter(
 *   id = "distance_from_user",
 *   label = @Translation("Distance From User"),
 *   field_types = {
 *     "geolocation"
 *   }
 * )
 */
class DistanceFromUserFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      // Implement default settings.
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    return [
      // Implement settings form.
    ] + parent::settingsForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];

    $summary[] = t('Displays distance from the user using javascript.');

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      $elements[$delta] = [$this->generateGps($item)];
    }

    return $elements;
  }

  /**
   * Generate the output appropriate for one field item.
   *
   * @param \Drupal\Core\Field\FieldItemInterface $item
   *   One field item.
   *
   * @return string
   *   The textual output generated.
   */
  protected function generateGps(FieldItemInterface $item) {
    $value = $item->getValue();
    $output = [
      '#type' => 'container',
      '#attributes' => [
        'data-lat' => $value['lat'],
        'data-lng' => $value['lng'],
        'class' => ['gps-display-distance'],
      ],
      '#attached' => [
        'library' => ['custom_field_formatter/custom_field_formatter.distancefromuser'],
      ],
    ];
    return $output;
  }

}
