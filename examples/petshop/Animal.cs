namespace Petshop;

/// <summary>
/// No default implementation — every animal overrides Speak.
/// </summary>
public abstract class Animal
{
    public string Name { get; set; }
    public int Age { get; set; }

    public abstract void Speak();
}
